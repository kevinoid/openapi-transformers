/**
 * Script to replace schemas using allOf/anyOf/oneOf with a single child schema
 * by the child schema with parent attributes applied.
 *
 * Schemas which use the workaround suggested by Ian Goncharov
 * https://github.com/OAI/OpenAPI-Specification/issues/556#issuecomment-192007034
 * in order to define properties with a $ref type and additional attributes
 * (e.g. description, deprecated, xml) will not work with Autorest due to
 * Azure/autorest#2652 and Azure/autorest#3417.  Support for Autorest can be
 * achieved by moving the attributes onto the $ref object (which violates OAS
 * and JSON Reference, but is accepted by Autorest), as done by this script.
 *
 * @copyright Copyright 2019 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import { debuglog, isDeepStrictEqual } from 'util';

import OpenApiTransformerBase from 'openapi-transformer-base';

const debug = debuglog('collapse-single-of');

function hasCollision(schema, ofSchema, ofName) {
  return Object.keys(schema)
    .some((prop) => {
      if (hasOwnProperty.call(ofSchema, prop)
        && !isDeepStrictEqual(schema[prop], ofSchema[prop])) {
        debug('Not collapsing %O due to differing %O', ofName, prop);
        return true;
      }

      return false;
    });
}

export default class CollapseSingleOfTransformer
  extends OpenApiTransformerBase {
  transformSchema(schema) {
    let newSchema = super.transformSchema(schema);

    for (const ofName of ['allOf', 'anyOf', 'oneOf']) {
      const ofSchemas = newSchema[ofName];
      if (Array.isArray(ofSchemas)
          && ofSchemas.length === 1
          && !hasCollision(newSchema, ofSchemas[0], ofName)) {
        newSchema = {
          ...newSchema,
          ...ofSchemas[0],
        };
        delete newSchema[ofName];
      }
    }

    return newSchema;
  }
}
