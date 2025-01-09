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
 * @param {boolean} refNullable Treat $ref as nullable.
 * @returns {boolean} <c>true</c> if <c>null</c> is a valid value for
 * <c>schema</c>.
 */
function isNullable(schema, hasNullType, refNullable) {
  if (schema.$ref) {
    return refNullable;
  }

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
 * @param {boolean} refNullable Treat $ref as nullable.
 * @returns {?boolean} <c>true</c> if <c>null</c> is known to be a valid value
 * for <c>propName</c> in <c>schema</c>, <c>false</c> if <c>null</c> is known
 * to be an invalid value for <c>propName</c> in <c>schema</c>.
 * <c>undefined</c> if <c>propName</c> is not constrained by <c>schema</c>.
 */
function isPropNullable(schema, propName, hasNullType, refNullable) {
  const {
    additionalProperties,
    allOf,
    anyOf,
    oneOf,
    properties,
  } = schema;
  let constrained = false;
  const propSchema = properties?.[propName];
  if (propSchema) {
    constrained = true;
    if (!isNullable(propSchema, hasNullType, refNullable)) {
      return false;
    }
  } else if (additionalProperties) {
    constrained = true;
    if (!isNullable(additionalProperties, hasNullType, refNullable)) {
      // schema in additionalProperties does not allow null
      return false;
    }
  } else if (additionalProperties === false) {
    // would fail validation if property is present
    return false;
  }

  if (Array.isArray(allOf)) {
    for (const allSchema of allOf) {
      switch (isPropNullable(allSchema, propName, hasNullType, refNullable)) {
        case false:
          // If an allOf schema doesn't allow null, it's not allowed.
          return false;

        case true:
          // An allOf schema allows null
          constrained = true;
          break;

        default:
          // An allOf schema doesn't constrain propName
          break;
      }
    }
  }

  if (Array.isArray(anyOf)) {
    let anyNullable = false;
    let anyUnconstrained = false;
    for (const anySchema of anyOf) {
      switch (isPropNullable(anySchema, propName, hasNullType, refNullable)) {
        case false:
          // An anyOf schema disallows null
          break;

        case true:
          // An anyOf schema allows null
          anyNullable = true;
          break;

        default:
          // An anyOf schema doesn't constrain propName
          anyUnconstrained = true;
          break;
      }
    }

    if (!anyNullable && !anyUnconstrained) {
      return false;
    }

    if (!anyUnconstrained) {
      constrained = true;
    }
  }

  if (Array.isArray(oneOf)) {
    let anyNullable = false;
    let anyUnconstrained = false;
    for (const oneSchema of oneOf) {
      switch (isPropNullable(oneSchema, propName, hasNullType, refNullable)) {
        case false:
          // A oneOf schema disallows null
          break;

        case true:
          // A oneOf schema allows null
          anyNullable = true;
          break;

        default:
          // A oneOf schema doesn't constrain propName
          anyUnconstrained = true;
          break;
      }
    }

    if (!anyNullable && !anyUnconstrained) {
      return false;
    }

    if (!anyUnconstrained) {
      constrained = true;
    }
  }

  return constrained ? true : undefined;
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

  refNullable = false;

  requireUnconstrained = false;

  constructor(options) {
    super();
    this.refNullable = Boolean(options?.refNullable);
    this.requireUnconstrained = Boolean(options?.requireUnconstrained);
  }

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
          (reqName) => !(isPropNullable(
            newSchema,
            reqName,
            this.hasNullType,
            this.refNullable,
          ) ?? !this.requireUnconstrained),
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
