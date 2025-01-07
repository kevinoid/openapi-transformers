/**
 * @copyright Copyright 2021, 2025 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 * @module "openapi-transformers/merge-any-of.js"
 */

import intersectSchema from 'json-schema-intersect';
import OpenApiTransformerBase from 'openapi-transformer-base';

/**
 * Transformer to merge anyOf schemas into the parent schema.
 *
 * This is useful for converting to OpenAPI 2.0 (which does not support
 * anyOf) from later versions, or to accommodate tools which do not support
 * anyOf well (e.g. many strongly-typed code generators).
 */
export default class MergeAnyOfTransformer extends OpenApiTransformerBase {
  transformSchema(schema) {
    const newSchema = super.transformSchema(schema);
    if (!newSchema || typeof newSchema !== 'object') {
      // Note: warning already emitted by super.transformSchema()
      return newSchema;
    }

    const {
      anyOf,
      ...schemaNoAnyOf
    } = newSchema;
    if (!Array.isArray(anyOf)) {
      this.warn('Unable to merge non-Array anyOf', anyOf);
      return newSchema;
    }

    if (anyOf.length === 0) {
      // Empty anyOf Array is disallowed by JSON Schema.
      // Not safe to remove since all instances will fail to "validate
      // successfully against at least one schema".
      this.warn('Unable to merge empty anyOf Array');
      return newSchema;
    }

    if (anyOf.length > 1) {
      throw new Error('Merging multiple anyOf schemas not implemented');
    }

    return intersectSchema(schemaNoAnyOf, anyOf[0]);
  }
}
