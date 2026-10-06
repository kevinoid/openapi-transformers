/**
 * @copyright Copyright 2020 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 * @module "openapi-transformers/inline-non-object-schemas.js"
 */

import { debuglog } from 'node:util';

import { JsonPointer } from 'json-ptr';
import OpenApiTransformerBase from 'openapi-transformer-base';

const debug = debuglog('inline-non-object-schemas');

// JSON Schema validation keywords supported by Autorest which must be inlined
// https://github.com/Azure/azure-sdk-for-net/blob/master/sdk/mgmtcommon/ClientRuntime/ClientRuntime/ValidationRules.cs
// Note: exclusiveMaximum/Minimum only modify maximum/minimum validation.
const validationKeywords = {
  maxItems: true,
  maxLength: true,
  maximum: true,
  minItems: true,
  minLength: true,
  minimum: true,
  multipleOf: true,
  pattern: true,
  uniqueItems: true,
};

/**
 * Transformer to inline schemas with non-object type so that Autorest will
 * generate validation code.
 *
 * https://github.com/Azure/autorest.csharp/issues/795
 */
export default class InlineNonObjectSchemaTransformer
  extends OpenApiTransformerBase {
  #inlineAll;

  #resolveRef;

  constructor({ inlineAll, resolveRef } = {}) {
    super();

    if (resolveRef !== undefined && typeof resolveRef !== 'function') {
      throw new TypeError('resolveRef must be a function');
    }

    this.#inlineAll = Boolean(inlineAll);
    this.#resolveRef = resolveRef;
  }

  transformSchema(schema) {
    const { $ref, ...nonRef } = schema;
    if (typeof $ref !== 'string') {
      return super.transformSchema(schema);
    }

    const refSchema = this.#resolveRef($ref);
    if (refSchema === undefined) {
      debug('Unable to resolve $ref %s', $ref);
      return super.transformSchema(schema);
    }

    if (!refSchema || !refSchema.type || refSchema.type === 'object') {
      debug('Not inlining %s: type %s', $ref, refSchema && refSchema.type);
      return super.transformSchema(schema);
    }

    if (refSchema.enum) {
      debug('Not inlining %s: enum', $ref);
      return super.transformSchema(schema);
    }

    if (!this.#inlineAll
      && Object.keys(refSchema).every((prop) => !validationKeywords[prop])
      // exclusiveMaximum/exclusiveMinimum are numbers in JSON Schema
      // Draft 2020-12 referenced by OAS 3.1.0 and apply on their own:
      // https://datatracker.ietf.org/doc/html/draft-bhutton-json-schema-validation-00#section-6.2.3
      // exclusiveMaximum/exclusiveMinimum are boolean in JSON Schema Write 00
      // referenced by OAS 3.0:
      // https://datatracker.ietf.org/doc/html/draft-wright-json-schema-validation-00#section-5.3
      // and JSON Schema Draft 4 referenced by OAS 2:
      // https://datatracker.ietf.org/doc/html/draft-fge-json-schema-validation-00#section-5.1.2
      // which only affect minimum/maximum and have no effect on their own.
      && typeof refSchema.exclusiveMaximum !== 'number'
      && typeof refSchema.exclusiveMinimum !== 'number') {
      debug(
        'Not inlining %s: No validation keywords require inlining',
        $ref,
      );
      return super.transformSchema(schema);
    }

    debug('Inlining %s.', $ref);
    return {
      ...super.transformSchema(refSchema),
      // Like Autorest, allow properties other than $ref
      ...nonRef,
    };
  }

  transformOpenApi(openapi) {
    // If resolveRef was not set from options, resolve against OpenAPI
    // Object being transformed.
    const optResolve = this.#resolveRef;
    if (!optResolve) {
      this.#resolveRef = function resolveRef($ref) {
        // JsonPointer.get would throw for non-local refs
        return $ref[0] === '#' ? JsonPointer.get(openapi, $ref) : undefined;
      };
    }

    try {
      return super.transformOpenApi(openapi);
    } finally {
      if (optResolve) {
        this.#resolveRef = optResolve;
      }
    }
  }
}
