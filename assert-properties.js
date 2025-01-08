/**
 * @copyright Copyright 2025 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 * @module "openapi-transformers/assert-properties.js"
 */

import OpenApiTransformerBase from 'openapi-transformer-base';

/**
 * Transformer which throws an Error when given properties are present in the
 * OpenAPI document.
 */
export default class AssertPropertiesTransformer
  extends OpenApiTransformerBase {
  options = {};

  constructor(options) {
    super();

    if (typeof options !== 'object' || options === null) {
      throw new TypeError('options must be an object');
    }

    if (typeof options.schema !== 'object' || options.schema === null) {
      throw new TypeError('options.schema must be an object');
    }

    if (!Array.isArray(options.schema.excludes)) {
      throw new TypeError('options.schema.excludes must be an Array');
    }

    if (!options.schema.excludes.every((s) => typeof s === 'string')) {
      throw new TypeError(
        'options.schema.excludes must only contain property names',
      );
    }

    this.options = options;
  }

  transformSchema(schema) {
    const newSchema = super.transformSchema(schema);
    if (typeof newSchema !== 'object' || newSchema === null) {
      return newSchema;
    }

    for (const propName of this.options.schema.excludes) {
      if (newSchema[propName] !== undefined
        && Object.hasOwn(newSchema, propName)) {
        throw new Error(`Schema contains ${propName}`);
      }
    }

    return newSchema;
  }
}
