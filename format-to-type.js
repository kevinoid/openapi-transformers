/**
 * @copyright Copyright 2019 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import OpenApiTransformerBase from 'openapi-transformer-base';

function transformSchemaType(schema) {
  if (schema.type === 'string') {
    const formatToType = {
      decimal: 'number',
      double: 'number',
      float: 'number',
      integer: 'integer',
      int32: 'integer',
      int64: 'integer',
    };
    const newType = formatToType[schema.format];
    if (newType) {
      const newSchema = {
        ...schema,
        type: newType,
      };
      if (newSchema.format === 'integer') {
        // format: integer is redundant with type: integer
        delete newSchema.format;
      }
      return newSchema;
    }
  }

  return schema;
}

/**
 * Transformer to convert known formats in an OAS3 doc to types (for Autorest).
 *
 * Autorest doesn't generate int/decimal/double properties for type: string.
 * Change the type to generate as desired.
 */
export default class FormatToTypeTransformer extends OpenApiTransformerBase {
  transformSchema(schema) {
    return transformSchemaType(super.transformSchema(schema));
  }

  transformParameter(parameter) {
    return transformSchemaType(super.transformParameter(parameter));
  }

  transformHeader(header) {
    return transformSchemaType(super.transformHeader(header));
  }
}
