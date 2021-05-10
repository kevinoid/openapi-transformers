/**
 * Script to make properties which are nullable non-required to work around
 * partial support for x-nullable in Autorest.  Currently nullable data types
 * are used (e.g. Nullable<int>) but the Validate() method doesn't allow null.
 * See:  https://github.com/Azure/autorest/issues/3300
 *
 * @copyright Copyright 2019 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import OpenApiTransformerBase from 'openapi-transformer-base';

function isNullable(schema, propName) {
  const {
    additionalProperties,
    allOf,
    anyOf,
    oneOf,
    properties,
  } = schema;
  if (properties && hasOwnProperty.call(properties, propName)) {
    const propSchema = properties[propName];
    if (!propSchema.nullable && !propSchema['x-nullable']) {
      // schema in properties does not allow null
      return false;
    }
  } else if (additionalProperties === false) {
    // would fail validation if property is present
    return false;
  } else if (typeof additionalProperties === 'object'
      && !additionalProperties.nullable
      && !additionalProperties['x-nullable']) {
    // schema in additionalProperties does not allow null
    return false;
  }

  if (allOf
    && !allOf.every((allSchema) => isNullable(allSchema, propName))) {
    // at least one schema in allOf does not allow null
    return false;
  }

  if (anyOf
    && !anyOf.some((anySchema) => isNullable(anySchema, propName))) {
    // no schema in anyOf allows null
    return false;
  }

  if (oneOf
    && !oneOf.some((oneSchema) => isNullable(oneSchema, propName))) {
    // no schema in oneOf allows null
    return false;
  }

  return true;
}

// eslint-disable-next-line import/no-unused-modules
export default class NullableNotRequiredTransformer
  extends OpenApiTransformerBase {
  transformSchema(schema) {
    const newSchema = super.transformSchema(schema);
    if (!newSchema.required) {
      return newSchema;
    }

    const transformed = {
      ...newSchema,
      required: newSchema.required
        .filter((reqName) => !isNullable(newSchema, reqName)),
    };

    if (transformed.required.length === 0) {
      delete transformed.required;
    }

    return transformed;
  }
}
