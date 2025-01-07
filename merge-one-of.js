/**
 * @copyright Copyright 2021, 2025 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 * @module "openapi-transformers/merge-one-of.js"
 */

import intersectSchema from 'json-schema-intersect';
import OpenApiTransformerBase from 'openapi-transformer-base';

/**
 * Transformer to merge oneOf schemas into the parent schema.
 *
 * This is useful for converting to OpenAPI 2.0 (which does not support
 * oneOf) from later versions, or to accommodate tools which do not support
 * oneOf well (e.g. many strongly-typed code generators).
 */
export default class MergeOneOfTransformer extends OpenApiTransformerBase {
  transformSchema(schema) {
    const newSchema = super.transformSchema(schema);
    if (!newSchema || typeof newSchema !== 'object') {
      // Note: warning already emitted by super.transformSchema()
      return newSchema;
    }

    const {
      oneOf,
      ...schemaNoOneOf
    } = newSchema;
    if (!Array.isArray(oneOf)) {
      this.warn('Unable to merge non-Array oneOf', oneOf);
      return newSchema;
    }

    if (oneOf.length === 0) {
      // Empty oneOf Array is disallowed by JSON Schema.
      // Not safe to remove since all instances will fail to "validate
      // successfully against exactly one schema".
      this.warn('Unable to merge empty oneOf Array');
      return newSchema;
    }

    if (oneOf.length > 1) {
      throw new Error('Merging multiple oneOf schemas not implemented');
    }

    return intersectSchema(schemaNoOneOf, oneOf[0]);
  }
}
