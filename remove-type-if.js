/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 * @module "openapi-transformers/remove-type.js"
 */

import OpenApiTransformerBase from 'openapi-transformer-base';

const predicateSymbol = Symbol('predicate');

/** Checks if a given type constraint validates all types other than null.
 *
 * The type constraint may or may not include null.
 *
 * This predicate is useful for conversion of schemas which explicitly accept
 * any type (and are only valid in OAS 3.1 and JSON Schema) to implicitly
 * accept any type (which are valid in all OAS and JSON Schema versions).
 * "null" is excluded because it must be handled by `nullable` in OAS 3
 * (and `x-nullable` in OAS 2).
 *
 * @param {string|!Array<string>} type Schema Object type.
 * @returns {boolean} true if type is an Array which contains the 5 JSON
 * Schema types other than "null" (handled by `nullable`) and "integer"
 * (covered by "number"), which may or may not be present.  Otherwise false.
 */
export function allNonNullTypes(type) {
  return Array.isArray(type)
    && type.length >= 5
    && [
      'array',
      'boolean',
      'number',
      'object',
      'string',
    ].every((t) => type.includes(t));
}

/**
 * Removes `type` from Schema Objects where `type` matches a given predicate.
 */
export default class RemoveTypeIfTransformer extends OpenApiTransformerBase {
  constructor(predicate) {
    super();

    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }

    this[predicateSymbol] = predicate;
  }

  transformSchema(schema) {
    const newSchema = super.transformSchema(schema);
    if (newSchema === null
      || typeof newSchema !== 'object'
      || Array.isArray(newSchema)
      || newSchema.type === undefined) {
      return newSchema;
    }

    const { type, ...schemaNoType } = newSchema;
    return this[predicateSymbol](type) ? schemaNoType : newSchema;
  }
}
