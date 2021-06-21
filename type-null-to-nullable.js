/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 * @module "openapi-transformers/type-null-to-nullable.js"
 */

import OpenApiTransformerBase from 'openapi-transformer-base';

/**
 * Transform Schema Objects with `'null'` in `type` (as in OAS 3.1 and JSON
 * Schema) to `nullable: true`.
 */
export default class TypeNullToNullableTransformer
  extends OpenApiTransformerBase {
  transformSchema(schema) {
    const newSchema = super.transformSchema(schema);
    if (newSchema === null
      || typeof newSchema !== 'object'
      || Array.isArray(newSchema)) {
      return newSchema;
    }

    const { type } = newSchema;
    if (!Array.isArray(type)) {
      // Can't remove 'null' from non-Array type
      // Note: See null-type-to-enum for handling `type: 'null'`
      return newSchema;
    }

    const newType = type.filter((t) => t !== 'null');
    if (newType.length === type.length) {
      // type does not contain 'null'
      return newSchema;
    }

    if (newType.length === 0) {
      // Can't handle type with only 'null'
      // Note: See null-type-to-enum for handling `type: 'null'`
      return newSchema;
    }

    const { nullable } = newSchema;
    if (nullable !== undefined && nullable !== true) {
      this.warn(
        'schema with nullable: %o and type: null!?',
        nullable,
        newSchema,
      );
    }

    return {
      ...newSchema,
      type: newType.length === 1 ? newType[0] : newType,
      nullable: nullable === undefined ? true : nullable,
    };
  }
}
