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

function mergeAllOf(schema, { skipAllOf }) {
  if (skipAllOf === true) {
    return schema;
  }

  const {
    allOf,
    ...schemaNoAllOf
  } = schema;
  if (!Array.isArray(allOf)
    || allOf.length === 0
    || (skipAllOf !== undefined && skipAllOf(allOf))) {
    return schema;
  }

  return allOf.reduce(intersectSchema, schemaNoAllOf);
}

function mergeAnyOf(schema, { skipAnyOf }) {
  if (skipAnyOf === true) {
    return schema;
  }

  const {
    anyOf,
    ...schemaNoAnyOf
  } = schema;
  if (!Array.isArray(anyOf)
    || anyOf.length === 0
    || (skipAnyOf !== undefined && skipAnyOf(anyOf))) {
    return schema;
  }

  const unioned = anyOf.reduce(unionSchema);
  return intersectSchema(schemaNoAnyOf, unioned);
}

function mergeOneOf(schema, { skipOneOf }) {
  if (skipOneOf === true) {
    return schema;
  }

  const {
    oneOf,
    ...schemaNoOneOf
  } = schema;
  if (!Array.isArray(oneOf)
    || oneOf.length === 0
    || (skipOneOf !== undefined && skipOneOf(oneOf))) {
    return schema;
  }

  const diffedSchema = oneOf.reduce(symDiffSchema);
  return intersectSchema(schemaNoOneOf, diffedSchema);
}

/** Options for MergeSubschemasTransformer.
 *
 * @typedef {!object} MergeSubschemasTransformerOptions
 * @property {(boolean|function(!Array<!object>):boolean)=} skipAllOf Boolean
 * or predicate which determines whether to skip merging an allOf constraint.
 * @property {(boolean|function(!Array<!object>):boolean)=} skipAnyOf Boolean
 * or predicate which determines whether to skip merging an anyOf constraint.
 * @property {(boolean|function(!Array<!object>):boolean)=} skipOneOf Boolean
 * or predicate which determines whether to skip merging a oneOf constraint.
 */

/**
 * Transformer to merge allOf/anyOf/oneOf schemas into the parent schema.
 *
 * This is useful for converting to OpenAPI 2.0 (which does not support
 * allOf/anyOf/oneOf) from later versions, or to accommodate tools which
 * do not support allOf/anyOf/oneOf well (e.g. many strongly-typed code
 * generators).
 */
export default class MergeSubschemasTransformer extends OpenApiTransformerBase {
  /** Constructs a MergeSubschemasTransformer with given options.
   *
   * @param {MergeSubschemasTransformerOptions=} options Options.
   */
  constructor(options = {}) {
    if (options === null || typeof options !== 'object') {
      throw new TypeError('options must be an object');
    }

    super();

    this.options = options;
  }

  transformSchema(schema) {
    let newSchema = super.transformSchema(schema);
    if (!newSchema || typeof newSchema !== 'object') {
      // Note: warning already emitted by super.transformSchema()
      return newSchema;
    }

    try {
      newSchema = mergeAllOf(newSchema, this.options);
    } catch (errAllOf) {
      debug(
        'Unable to merge allOf schemas for %O: %s',
        newSchema,
        errAllOf,
      );
    }

    try {
      newSchema = mergeAnyOf(newSchema, this.options);
    } catch (errAnyOf) {
      debug(
        'Unable to merge anyOf schemas for %O: %s',
        newSchema,
        errAnyOf,
      );
    }

    try {
      newSchema = mergeOneOf(newSchema, this.options);
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
