/**
 * Script to replace boolean additionalProperties with an object schema to
 * work around https://github.com/Azure/autorest/issues/3439.
 *
 * @copyright Copyright 2019 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import OpenApiTransformerBase from 'openapi-transformer-base';

export default class AdditionalPropertiesToObjectTransformer
  extends OpenApiTransformerBase {
  transformSchema(schema) {
    if (typeof schema !== 'object' || schema === null) {
      return schema;
    }

    const newSchema = super.transformSchema(schema);
    const { additionalProperties } = newSchema;

    if (typeof additionalProperties !== 'boolean') {
      return newSchema;
    }

    return {
      ...newSchema,

      // Use schema equivalents described by current spec author Henry Andrews
      // https://groups.google.com/d/msg/json-schema/Es0fEf3hj2Y/MxWmgercBAAJ
      additionalProperties: additionalProperties ? {} : { not: {} },
    };
  }
}
