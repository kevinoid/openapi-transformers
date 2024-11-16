/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 * @module "openapi-transformers/const-to-enum.js"
 */

import OpenApiTransformerBase from 'openapi-transformer-base';

/**
 * Transformer to convert Schema Objects with `const` (as in OAS 3.1 and JSON
 * Schema) to `enum` for OAS 3.0 and 2.0.
 */
export default class ConstToEnumTransformer extends OpenApiTransformerBase {
  transformSchema(schema) {
    const newSchema = super.transformSchema(schema);
    if (newSchema === null
      || typeof newSchema !== 'object'
      || Array.isArray(newSchema)) {
      return newSchema;
    }

    const { const: constValue, ...schemaNoConst } = newSchema;
    if (constValue === undefined) {
      return newSchema;
    }

    const enumValues = schemaNoConst.enum;
    if (enumValues === undefined) {
      schemaNoConst.enum = [constValue];
    } else if (Array.isArray(enumValues)) {
      if (enumValues.includes(constValue)) {
        // Schema validation would only succeed for const value.
        // Safe to overwrite.
        schemaNoConst.enum = [constValue];
      } else if (enumValues.length > 0) {
        // Schema validation would always fail (because either const or enum
        // constraint would be unsatisfied).  Replace with empty enum, which
        // also always fails.
        this.warn(
          'Using empty enum for schema with const not in enum',
          newSchema,
        );
        schemaNoConst.enum = [];
      }
    }

    return schemaNoConst;
  }
}
