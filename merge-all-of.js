/**
 * @copyright Copyright 2021, 2025 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 * @module "openapi-transformers/merge-all-of.js"
 */

import { debuglog } from 'node:util';

import intersectSchema from 'json-schema-intersect';
import OpenApiTransformerBase from 'openapi-transformer-base';

const debug = debuglog('openapi-transformers:merge-all-of');

/**
 * Transformer to merge allOf schemas into the parent schema.
 *
 * This may be useful to accommodate tools which do not support allOf well
 * (e.g. some strongly-typed code generators).
 */
export default class MergeAllOfTransformer extends OpenApiTransformerBase {
  transformSchema(schema) {
    const newSchema = super.transformSchema(schema);
    if (!newSchema || typeof newSchema !== 'object') {
      // Note: warning already emitted by super.transformSchema()
      return newSchema;
    }

    const {
      allOf,
      ...schemaNoAllOf
    } = newSchema;
    if (!Array.isArray(allOf)) {
      this.warn('Unable to merge non-Array allOf', allOf);
      return newSchema;
    }

    if (allOf.length === 0) {
      // Empty allOf Array is disallowed by JSON Schema.
      // Considered safe to remove since any instance trivially validates
      // successfully against all 0 schemas.
      debug('Removing empty allOf');
      return schemaNoAllOf;
    }

    return allOf.reduce(intersectSchema, schemaNoAllOf);
  }
}
