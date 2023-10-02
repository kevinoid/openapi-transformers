/**
 * @copyright Copyright 2020 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 * @module "openapi-transformers/urlencoded-to-string.js"
 */

import OpenApiTransformerBase from 'openapi-transformer-base';

const consumesSymbol = Symbol('consumes');

function isFormData(mediaType) {
  return /^multipart\/form-data\s*(?:;.*)?$/i.test(mediaType);
}

function isUrlencoded(mediaType) {
  return /^application\/x-www-form-urlencoded\s*(?:;.*)?$/i.test(mediaType);
}

/**
 * Transformer to change request parameter types to string for operations which
 * only consume application/x-www-form-urlencoded, to work around
 * https://github.com/Azure/autorest/issues/3449
 */
export default class UrlencodedToStringTransformer
  extends OpenApiTransformerBase {
  constructor() {
    super();
    this[consumesSymbol] = undefined;
  }

  transformSchema(schema) {
    if (typeof schema !== 'object' || schema === null) {
      return schema;
    }

    let newSchema = super.transformSchema(schema);

    // Change primitive types to string
    if (['number', 'integer', 'boolean'].includes(schema.type)) {
      newSchema = {
        ...newSchema,
        type: 'string',
      };

      // TODO: Optionally remove constraints which don't apply to string type?
      // Older JSON Schema drafts (e.g. JSON Schema Draft 4 ref'd by OAS2)
      // specify the instance is only valid if it satisfies the constraint.
      // Newer JSON Schema drafts (e.g. Wright 00 ref'd by OAS3.1) specify
      // the constraint is ignored for non-numbers.
      // Autorest ignores these constraints on string properties.
      // They may be useful as documentation for API developers.
      // Is there a reason to remove them?
      /*
      delete newSchema.multipleOf;
      delete newSchema.minimum;
      delete newSchema.exclusiveMaximum;
      delete newSchema.maximum;
      delete newSchema.exclusiveMinimum;
      */
    }

    // Ensure enums are modeled as string
    const { type, 'x-ms-enum': xMsEnum } = newSchema;
    if (type === 'string'
      && xMsEnum
      && xMsEnum.modelAsString !== true) {
      newSchema = { ...newSchema };
      // Note: Could set modelAsString: true, but would cause conflict if any
      // other params/schemas have same name
      delete newSchema['x-ms-enum'];
    }

    // Note: There does not appear to be a need to remove validation properties
    // (e.g. minimum, maximum, etc.) since Autorest ignores them for string
    // properties.

    return newSchema;
  }

  transformParameter(parameter) {
    if (!parameter) {
      return parameter;
    }

    if (parameter.in === 'formData') {
      return this.transformSchema(parameter);
    }

    if (parameter.in === 'body' && parameter.schema) {
      return {
        ...parameter,
        schema: this.transformSchema(parameter.schema),
      };
    }

    return parameter;
  }

  transformRequestBody(requestBody) {
    if (!requestBody || !requestBody.content) {
      return requestBody;
    }

    const { content } = requestBody;
    const consumes = Object.keys(content);
    const urlencoded = consumes.find(isUrlencoded);
    if (!urlencoded) {
      return requestBody;
    }

    return {
      ...requestBody,
      content: {
        ...content,
        [urlencoded]: this.transformMediaType(content[urlencoded]),
      },
    };
  }

  transformOperation(operation) {
    if (!operation) {
      return super.transformOperation(operation);
    }

    const { parameters, requestBody } = operation;
    if (requestBody === undefined && !Array.isArray(parameters)) {
      return operation;
    }

    const newOperation = { ...operation };

    const consumes = operation.consumes || this[consumesSymbol];
    if (parameters !== undefined
      && Array.isArray(consumes)
      && consumes.some(isUrlencoded)
      && !consumes.some(isFormData)) {
      newOperation.parameters =
        parameters.map(this.transformParameter.bind(this));
    }

    if (requestBody !== undefined) {
      newOperation.requestBody =
        this.transformRequestBody(newOperation.requestBody);
    }

    return newOperation;
  }

  transformOpenApi(openApi) {
    this[consumesSymbol] = openApi.consumes;
    try {
      return {
        ...openApi,
        paths: this.transformPaths(openApi.paths),
      };
    } finally {
      this[consumesSymbol] = undefined;
    }
  }
}
