/**
 * @copyright Copyright 2025 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 * @module "openapi-transformers/any-of-null-to-nullable.js"
 */

import { isDeepStrictEqual } from 'node:util';

import OpenApiTransformerBase from 'openapi-transformer-base';

/**
 * Transformer to convert Schema Objects with `type: 'null'` in `anyOf` (as in
 * OAS 3.1 and JSON Schema) to `nullable: true` (as in OAS 3.0).
 */
export default class AnyOfNullToNullableTransformer
  extends OpenApiTransformerBase {
  transformSchema(schema) {
    const newSchema = super.transformSchema(schema);
    if (newSchema === null
      || typeof newSchema !== 'object'
      || Array.isArray(newSchema)) {
      return newSchema;
    }

    const { anyOf, nullable } = newSchema;
    if (nullable !== undefined && nullable !== true) {
      return newSchema;
    }

    if (!Array.isArray(anyOf) || anyOf.length < 2) {
      return newSchema;
    }

    const anyOfNoNull =
      anyOf.filter((s) => !isDeepStrictEqual(s, { type: 'null' }));
    if (anyOfNoNull.length === anyOf.length) {
      return newSchema;
    }

    if (anyOfNoNull.length === 0) {
      return newSchema;
    }

    return {
      ...newSchema,
      nullable: true,
      anyOf: anyOfNoNull,
    };
  }
}
