/**
 * @copyright Copyright 2019-2020 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 * @module "openapi-transformers/additional-properties-to-unconstrained.js"
 */

import OpenApiTransformerBase from 'openapi-transformer-base';

/** Applies a predicate to each schema which contributes to the generated
 * type of a given schema.
 *
 * @private
 */
function someCombinedSchema(schema, predicate) {
  if (predicate(schema)) {
    return true;
  }

  if (typeof schema !== 'object' || schema === null) {
    return false;
  }

  if (['then', 'else'].some(
    (key) => someCombinedSchema(schema[key], predicate),
  )) {
    return true;
  }

  return ['allOf', 'anyOf', 'oneOf'].some(
    (key) => Array.isArray(schema[key])
      && schema[key].some((s) => someCombinedSchema(s, predicate)),
  );
}

/** Replaces additionalProperties (and patternProperties) in each schema which
 * contributes to the generated type of a given schema.
 *
 * @private
 */
function replaceAdditionalProperties(schema) {
  if (typeof schema !== 'object' || schema === null) {
    return schema;
  }

  const newSchema = { ...schema };

  for (const key of ['additionalProperties', 'patternProperties']) {
    const propSchema = newSchema[key];
    if (typeof propSchema === 'object' && propSchema !== null) {
      // Note: Use {} instead of true to work around
      // https://github.com/Azure/autorest/issues/3439 and
      // https://github.com/Azure/autorest/issues/2564 (marked fixed, but fix
      // only covers additionalProperties on top-level schemas)
      newSchema[key] = {};
    }
  }

  for (const key of ['then', 'else']) {
    if (newSchema[key] !== undefined) {
      newSchema[key] = replaceAdditionalProperties(newSchema[key]);
    }
  }

  for (const key of ['allOf', 'anyOf', 'oneOf']) {
    if (Array.isArray(newSchema[key])) {
      newSchema[key] = newSchema[key].map(replaceAdditionalProperties);
    }
  }

  return newSchema;
}

/** Does a schema describe an object with at least one property?
 *
 * @private
 */
function hasProperties(schema) {
  return schema
    && schema.properties
    && Object.keys(schema.properties).length > 0;
}

/** Does a schema describe an object with constrained additionalProperties
 * (or patternProperties)?
 *
 * @private
 */
function hasConstrainedAdditionalProps(schema) {
  return schema
    && ((schema.additionalProperties
        && Object.keys(schema.additionalProperties).length > 0)
      || (schema.patternProperties
        && Object.keys(schema.patternProperties).length > 0));
}

/**
 * Transformer to replace additionalProperties (and patternProperties) with an
 * unconstrained schema alongside other properties to work around
 * https://github.com/Azure/autorest/issues/2469
 */
export default class AdditionalPropertiesToUnconstrainedTransformer
  extends OpenApiTransformerBase {
  transformSchema(schema) {
    let newSchema;
    if (someCombinedSchema(schema, hasConstrainedAdditionalProps)
      && someCombinedSchema(schema, hasProperties)) {
      newSchema = replaceAdditionalProperties(schema);
    } else {
      newSchema = schema;
    }

    // Search for additionalProperties in child schemas
    return super.transformSchema(newSchema);
  }
}
