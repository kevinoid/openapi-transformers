/**
 * @copyright Copyright 2019 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 * @module "openapi-transformers/nullable-not-required.js"
 */

import OpenApiTransformerBase from 'openapi-transformer-base';

/**
 * Determines whether a given property of a given schema can have a null value.
 *
 * @param {!object} schema OpenAPI Schema object.
 * @param {string} propName Name of property to check.
 * @returns {boolean} <c>true</c> if <c>null</c> is a valid value for
 * <c>propName</c> in <c>schema</c>.
 */
function isPropNullable(schema, propName) {
  const {
    additionalProperties,
    allOf,
    anyOf,
    oneOf,
    properties,
  } = schema;
  const propSchema = properties?.[propName];
  if (propSchema) {
    // null is only allowed with nullable (or x-nullable)
    if (!propSchema.nullable && !propSchema['x-nullable']) {
      return false;
    }
  } else {
    if (additionalProperties === false) {
      // would fail validation if property is present
      return false;
    }

    if (typeof additionalProperties === 'object'
        && !additionalProperties.nullable
        && !additionalProperties['x-nullable']) {
      // schema in additionalProperties does not allow null
      return false;
    }
  }

  if (allOf
    && !allOf.every((allSchema) => isPropNullable(allSchema, propName))) {
    // at least one schema in allOf does not allow null
    return false;
  }

  if (anyOf
    && !anyOf.some((anySchema) => isPropNullable(anySchema, propName))) {
    // no schema in anyOf allows null
    return false;
  }

  if (oneOf
    && !oneOf.some((oneSchema) => isPropNullable(oneSchema, propName))) {
    // no schema in oneOf allows null
    return false;
  }

  return true;
}

/**
 * Transformer to make properties which are nullable non-required to work around
 * partial support for x-nullable in Autorest.  Currently nullable data types
 * are used (e.g. Nullable<int>) but the Validate() method doesn't allow null.
 * See:  https://github.com/Azure/autorest/issues/3300
 */
export default class NullableNotRequiredTransformer
  extends OpenApiTransformerBase {
  transformSchema(schema) {
    const newSchema = super.transformSchema(schema);
    if (!Array.isArray(newSchema?.required)
      || newSchema.required.length === 0) {
      return newSchema;
    }

    const transformed = {
      ...newSchema,
      required: newSchema.required
        .filter((reqName) => !isPropNullable(newSchema, reqName)),
    };

    if (transformed.required.length === 0) {
      delete transformed.required;
    }

    return transformed;
  }
}
