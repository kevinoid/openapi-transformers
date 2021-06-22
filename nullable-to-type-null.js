/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 * @module "openapi-transformers/nullable-to-type-null.js"
 */

import OpenApiTransformerBase from 'openapi-transformer-base';

/**
 * Add `'null'` to `type` of Schema Objects with `nullable: true` or
 * `x-nullable: true`.
 *
 * This is useful for converting from OpenAPI 2.0/3.0 to OpenAPI 3.1 or
 * JSON Schema.
 */
export default class NullableToTypeNullTransformer
  extends OpenApiTransformerBase {
  transformSchema(schema) {
    schema = super.transformSchema(schema);
    if (schema === null
      || typeof schema !== 'object'
      || Array.isArray(schema)) {
      return schema;
    }

    const {
      nullable,
      'x-nullable': xNullable,
      ...schemaNoNullable
    } = schema;
    if (nullable !== true && xNullable !== true) {
      return schema;
    }

    const { type } = schema;
    if (Array.isArray(type)) {
      if (!type.includes('null')) {
        schemaNoNullable.type = [...type, 'null'];
      }
    } else if (type !== undefined) {
      schemaNoNullable.type = [type, 'null'];
    }

    return schemaNoNullable;
  }
}
