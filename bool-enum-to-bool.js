/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 * @module "openapi-transformers/bool-enum-to-bool.js"
 */

import OpenApiTransformerBase from 'openapi-transformer-base';

/**
 * Transformer to replace `enum: [true, false]` with `type: boolean` for
 * simplicity and to assist generators.
 */
export default class BoolEnumToBoolTransformer
  extends OpenApiTransformerBase {
  #inStringContext;

  constructor() {
    super();
    this.#inStringContext = false;
  }

  transformSchemaLike(schema) {
    if (schema === null
      || typeof schema !== 'object'
      || Array.isArray(schema)) {
      return schema;
    }

    const { enum: enumValues, ...schemaNoEnum } = schema;
    if (!Array.isArray(enumValues) || enumValues.length < 2) {
      return schema;
    }

    const { type } = schema;
    if (type !== 'boolean'
      && !this.#inStringContext
      && enumValues.some((ev) => typeof ev !== 'boolean')) {
      // If schema validates non-boolean values in a type-sensitive context,
      // limiting to boolean would change validation.
      return schema;
    }

    if (!(enumValues.includes(true) || enumValues.includes('true'))
      || !(enumValues.includes(false) || enumValues.includes('false'))
      || enumValues.some((ev) => ev !== true
        && ev !== false
        && ev !== 'true'
        && ev !== 'false')) {
      // Enum must contain both true and false, and only true/false
      return schema;
    }

    schemaNoEnum.type = 'boolean';

    return schemaNoEnum;
  }

  transformSchema(schema) {
    return this.transformSchemaLike(super.transformSchema(schema));
  }

  transformItems(items) {
    return this.transformSchemaLike(super.transformItems(items));
  }

  transformHeader(header) {
    const prevContext = this.#inStringContext;
    try {
      this.#inStringContext = true;
      return this.transformSchemaLike(super.transformHeader(header));
    } finally {
      this.#inStringContext = prevContext;
    }
  }

  transformParameter(parameter) {
    const prevContext = this.#inStringContext;
    try {
      this.#inStringContext = parameter.in !== 'body';
      return this.transformSchemaLike(super.transformParameter(parameter));
    } finally {
      this.#inStringContext = prevContext;
    }
  }

  transformMediaType(mediaType) {
    const prevContext = this.#inStringContext;
    const mediaTypeStr = this.transformPath.at(-1);
    try {
      this.#inStringContext =
        mediaTypeStr === 'application/x-www-form-urlencoded'
        || mediaTypeStr === 'multipart/form-data'
        || mediaTypeStr === 'text/csv'
        || mediaTypeStr === 'text/plain';
      return super.transformMediaType(mediaType);
    } finally {
      this.#inStringContext = prevContext;
    }
  }
}
