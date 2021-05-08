/**
 * Script to remove empty arrays from anyOf and oneOf schemas.  Empty arrays
 * are returned in place of empty objects by the BambooHR API in some places
 * (e.g. TimeOffRequest.notes) and anyOf/oneOf are not currently supported by
 * code generators (except for inheritance).
 *
 * @copyright Copyright 2019 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import OpenApiTransformerBase from 'openapi-transformer-base';

function isNotEmptyArraySchema(schema) {
  return schema.type !== 'array' || schema.maxItems !== 0;
}

// eslint-disable-next-line import/no-unused-modules
export default class RemoveAnyOfEmptyArrayTransformer
  extends OpenApiTransformerBase {
  transformSchema(schema) {
    let newSchema = super.transformSchema(schema);

    for (const anyOneOfName of ['anyOf', 'oneOf']) {
      const anyOneOf = newSchema[anyOneOfName];
      if (Array.isArray(anyOneOf)) {
        const newAnyOneOf = anyOneOf.filter(isNotEmptyArraySchema);
        if (newAnyOneOf.length !== anyOneOf.length) {
          if (newAnyOneOf.length === 1 && Object.keys(newSchema).length === 1) {
            // anyOf/oneOf with one choice is the only schema property.
            // Use the schema directly.
            [newSchema] = newAnyOneOf;
          } else {
            newSchema = {
              ...newSchema,
              [anyOneOfName]: newAnyOneOf,
            };
          }
        }
      }
    }

    return newSchema;
  }
}
