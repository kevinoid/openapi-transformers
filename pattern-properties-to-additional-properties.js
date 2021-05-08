/**
 * Script to replace boolean additionalProperties with an object schema to
 * work around https://github.com/Azure/autorest/issues/3439.
 *
 * @copyright Copyright 2019 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import OpenApiTransformerBase from 'openapi-transformer-base';
import { isDeepStrictEqual } from 'util';

// eslint-disable-next-line import/no-unused-modules
export default class PatternPropertiesToAdditionalPropertiesTransformer
  extends OpenApiTransformerBase {
  transformSchema(schema) {
    if (typeof schema !== 'object' || schema === null) {
      return schema;
    }

    schema = super.transformSchema(schema);

    const {
      patternProperties,
      ...newSchema
    } = schema;
    if (typeof patternProperties !== 'object' || patternProperties === null) {
      return schema;
    }

    const uniquePropSchemas = [];
    for (const propSchema of Object.values(patternProperties)) {
      if (propSchema !== undefined
        && !uniquePropSchemas.some((s) => isDeepStrictEqual(s, propSchema))) {
        uniquePropSchemas.push(propSchema);
      }
    }

    if (uniquePropSchemas.length === 0) {
      // Remove empty patternProperties object.
      return newSchema;
    }

    const { additionalProperties } = schema;
    if (additionalProperties !== undefined
      && !uniquePropSchemas
        .some((s) => isDeepStrictEqual(s, additionalProperties))) {
      uniquePropSchemas.push(additionalProperties);
    }

    if (uniquePropSchemas.length === 1) {
      newSchema.additionalProperties = uniquePropSchemas[0];
    } else {
      newSchema.additionalProperties = { anyOf: uniquePropSchemas };
    }

    return newSchema;
  }
}
