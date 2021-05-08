/**
 * Script to replace `type: string, format: binary` (or `format: file`) with
 * `type: file` so that Autorest generates to a Stream instead of string.
 *
 * @copyright Copyright 2019 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import OpenApiTransformerBase from 'openapi-transformer-base';

function transformSchemaType(schema) {
  if (schema.type === 'string'
      && (schema.format === 'binary' || schema.format === 'file')) {
    const newSchema = {
      ...schema,
      type: 'file',
    };
    delete newSchema.format;
    return newSchema;
  }

  return schema;
}

// eslint-disable-next-line import/no-unused-modules
export default class BinaryStringToFileTransformer
  extends OpenApiTransformerBase {
  // eslint-disable-next-line class-methods-use-this
  transformSchema(schema) {
    // Don't call super, since `type: file` is only allowed on root schema of
    // response.
    // Note: No checking is done to enforce this (due to $ref complications).
    // Note: A response could $ref a property schema.  Unlikely.
    return transformSchemaType(schema);
  }

  // eslint-disable-next-line class-methods-use-this
  transformParameter(parameter) {
    // Since `type: file` is not supported in OAS3,
    // no need to transform .schema property
    return transformSchemaType(parameter);
  }
}
