/**
 * @copyright Copyright 2020 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import OpenApiTransformerBase from 'openapi-transformer-base';

function isFormData(mediaType) {
  return /^multipart\/form-data\s*(;.*)?$/i.test(mediaType);
}

function isUrlencoded(mediaType) {
  return /^application\/x-www-form-urlencoded\s*(;.*)?$/i.test(mediaType);
}

/**
 * Transformer to change request parameter types to string for operations which
 * only consume application/x-www-form-urlencoded, to work around
 * https://github.com/Azure/autorest/issues/3449
 */
export default class UrlencodedToStringTransformer
  extends OpenApiTransformerBase {
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

    return newSchema;
  }

  transformParameter(parameter) {
    if (!parameter || parameter.in !== 'formData') {
      return parameter;
    }

    return this.transformSchema(parameter);
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

    const { consumes, parameters, requestBody } = operation;
    if (requestBody === undefined && !Array.isArray(parameters)) {
      return operation;
    }

    const newOperation = { ...operation };

    if (parameters !== undefined
      && Array.isArray(consumes)
      && consumes.some(isUrlencoded)
      && !consumes.some(isFormData)) {
      newOperation.parameters = parameters.map(this.transformParameter, this);
    }

    if (requestBody !== undefined) {
      newOperation.requestBody =
        this.transformRequestBody(newOperation.requestBody);
    }

    return newOperation;
  }

  transformOpenApi(openApi) {
    return {
      ...openApi,
      paths: this.transformPaths(openApi.paths),
    };
  }
}
