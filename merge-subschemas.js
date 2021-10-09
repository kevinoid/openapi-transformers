/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 * @module "openapi-transformers/merge-subschemas.js"
 */

import { debuglog } from 'util';

import OpenApiTransformerBase from 'openapi-transformer-base';

import intersectSchema from './lib/intersect-schema.js';

const debug = debuglog('merge-subschemas');

function symDiffSchema(schema1, schema2) {
  throw new Error('Not implemented');
}

function unionSchema(schema1, schema2) {
  throw new Error('Not implemented');
}

function mergeAllOf(schema) {
  const {
    allOf,
    ...schemaNoAllOf
  } = schema;
  if (!Array.isArray(allOf) || allOf.length === 0) {
    return schema;
  }

  return allOf.reduce(intersectSchema, schemaNoAllOf);
}

function mergeAnyOf(schema) {
  const {
    anyOf,
    ...schemaNoAnyOf
  } = schema;
  if (!Array.isArray(anyOf) || anyOf.length === 0) {
    return schema;
  }

  const unioned = anyOf.reduce(unionSchema);
  return intersectSchema(schemaNoAnyOf, unioned);
}

function mergeOneOf(schema) {
  const {
    oneOf,
    ...schemaNoOneOf
  } = schema;
  if (!Array.isArray(oneOf) || oneOf.length === 0) {
    return schema;
  }

  const diffedSchema = oneOf.reduce(symDiffSchema);
  return intersectSchema(schemaNoOneOf, diffedSchema);
}

/**
 * Transformer to merge allOf/anyOf/oneOf schemas into the parent schema.
 *
 * This is useful for converting to OpenAPI 2.0 (which does not support
 * allOf/anyOf/oneOf) from later versions, or to accommodate tools which
 * do not support allOf/anyOf/oneOf well (e.g. many strongly-typed code
 * generators).
 */
export default class MergeSubschemasTransformer extends OpenApiTransformerBase {
  transformSchema(schema) {
    let newSchema = super.transformSchema(schema);
    if (!newSchema || typeof newSchema !== 'object') {
      // Note: warning already emitted by super.transformSchema()
      return newSchema;
    }

    try {
      newSchema = mergeAllOf(newSchema);
    } catch (errAllOf) {
      debug(
        'Unable to merge allOf schemas for %O: %s',
        newSchema,
        errAllOf,
      );
    }

    try {
      newSchema = mergeAnyOf(newSchema);
    } catch (errAnyOf) {
      debug(
        'Unable to merge anyOf schemas for %O: %s',
        newSchema,
        errAnyOf,
      );
    }

    try {
      newSchema = mergeOneOf(newSchema);
    } catch (errOneOf) {
      debug(
        'Unable to merge oneOf schemas for %O: %s',
        newSchema,
        errOneOf,
      );
    }

    return newSchema;
  }
}
