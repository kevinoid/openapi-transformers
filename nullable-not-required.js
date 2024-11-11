/**
 * @copyright Copyright 2019-2024 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 * @module "openapi-transformers/nullable-not-required.js"
 */

import OpenApiTransformerBase from 'openapi-transformer-base';

/**
 * Determines whether a given Schema can have a null value.
 *
 * @param {!object} schema OpenAPI Schema object.
 * @param {boolean} hasNullType Whether 'null' is a valid Schema type.
 * @returns {boolean} <c>true</c> if <c>null</c> is a valid value for
 * <c>schema</c>.
 */
function isNullable(schema, hasNullType) {
  if (hasNullType) {
    const { type } = schema;
    if (typeof type === 'string') {
      if (type !== 'null') {
        // null forbidden by non-null type
        return false;
      }
    } else if (Array.isArray(type)
      && !type.includes('null')) {
      // null forbidden by null not in types
      return false;
    }
  } else if (!schema.nullable && !schema['x-nullable']) {
    // Without null type, null is only allowed with nullable (or x-nullable)
    return false;
  }

  return true;
}

/**
 * Determines whether a given property of a given schema can have a null value.
 *
 * @param {!object} schema OpenAPI Schema object.
 * @param {string} propName Name of property to check.
 * @param {boolean} hasNullType Whether 'null' is a valid Schema type.
 * @returns {boolean} <c>true</c> if <c>null</c> is a valid value for
 * <c>propName</c> in <c>schema</c>.
 */
function isPropNullable(schema, propName, hasNullType) {
  const {
    additionalProperties,
    allOf,
    anyOf,
    oneOf,
    properties,
  } = schema;
  const propSchema = properties?.[propName];
  if (propSchema) {
    if (!isNullable(propSchema, hasNullType)) {
      return false;
    }
  } else {
    if (additionalProperties === false) {
      // would fail validation if property is present
      return false;
    }

    if (additionalProperties
      && !isNullable(additionalProperties, hasNullType)) {
      // schema in additionalProperties does not allow null
      return false;
    }
  }

  if (allOf
    && !allOf.every(
      (allSchema) => isPropNullable(allSchema, propName, hasNullType),
    )) {
    // at least one schema in allOf does not allow null
    return false;
  }

  if (anyOf
    && !anyOf.some(
      (anySchema) => isPropNullable(anySchema, propName, hasNullType),
    )) {
    // no schema in anyOf allows null
    return false;
  }

  if (oneOf
    && !oneOf.some(
      (oneSchema) => isPropNullable(oneSchema, propName, hasNullType),
    )) {
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
  hasNullType = undefined;

  transformSchema(schema) {
    const newSchema = super.transformSchema(schema);
    if (!Array.isArray(newSchema?.required)
      || newSchema.required.length === 0) {
      // No properties are required. None to remove.
      return newSchema;
    }

    const transformed = {
      ...newSchema,
      required: newSchema.required
        .filter(
          (reqName) => !isPropNullable(newSchema, reqName, this.hasNullType),
        ),
    };

    if (transformed.required.length === 0) {
      delete transformed.required;
    }

    return transformed;
  }

  transformOpenApi(openApi) {
    const version = openApi?.openapi || openApi?.swagger;
    const verParts = version ? String(version).split('.').map(Number) : [];
    if (verParts[0] > 3 || (verParts[0] === 3 && verParts[1] >= 1)) {
      this.hasNullType = true;
    } else if (verParts[0] < 3 || (verParts[0] === 3 && verParts[1] < 1)) {
      this.hasNullType = false;
    }

    try {
      return super.transformOpenApi(openApi);
    } finally {
      this.hasNullType = undefined;
    }
  }
}
