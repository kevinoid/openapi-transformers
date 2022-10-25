/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 * @module "openapi-transformers/pattern-properties-to-additional-properties.js"
 */

import OpenApiTransformerBase from 'openapi-transformer-base';
import { isDeepStrictEqual } from 'node:util';

/**
 * Transformer to combine any patternProperties into additionalProperties (for
 * conversion from OpenAPI 3.1 to prior versions before patternProperties
 * was supported).
 * https://github.com/OAI/OpenAPI-Specification/issues/687
 */
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
