/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 * @module "openapi-transformers/type-null-to-enum.js"
 */

import { isDeepStrictEqual } from 'util';

import OpenApiTransformerBase from 'openapi-transformer-base';

/**
 * Transform Schema Objects with `type: 'null'` (as in OAS 3.1 and JSON Schema)
 * to `enum: [null]` for OAS 3.0 and 2.0.
 */
export default class TypeNullToEnumTransformer
  extends OpenApiTransformerBase {
  transformSchema(schema) {
    const newSchema = super.transformSchema(schema);
    if (newSchema === null
      || typeof newSchema !== 'object'
      || Array.isArray(newSchema)) {
      return newSchema;
    }

    const { type } = newSchema;
    if (type === 'null'
      || (Array.isArray(type)
        && type.length > 0
        && type.every((t) => t === 'null'))) {
      const { type: _, ...schemaNoType } = newSchema;
      if (schemaNoType.enum === undefined) {
        // eslint-disable-next-line unicorn/no-null
        schemaNoType.enum = [null];
      // eslint-disable-next-line unicorn/no-null
      } else if (!isDeepStrictEqual(schemaNoType.enum, [null])) {
        this.warn(
          'refusing to overwrite enum of schema with type: null',
          newSchema,
        );
      }

      return schemaNoType;
    }

    return newSchema;
  }
}
