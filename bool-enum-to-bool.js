/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 * @module "openapi-transformers/bool-enum-to-bool.js"
 */

import OpenApiTransformerBase from 'openapi-transformer-base';

const inStringContextSymbol = Symbol('inStringContext');

/**
 * Replace `enum: [true, false]` with `type: boolean` for simplicity and
 * to assist generators.
 */
export default class BoolEnumToBoolTransformer
  extends OpenApiTransformerBase {
  constructor() {
    super();
    this[inStringContextSymbol] = false;
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
    if (!this[inStringContextSymbol]
      && type !== 'boolean'
      && !enumValues.every((ev) => typeof ev === 'boolean')) {
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
    const prevContext = this[inStringContextSymbol];
    try {
      this[inStringContextSymbol] = true;
      return this.transformSchemaLike(super.transformHeader(header));
    } finally {
      this[inStringContextSymbol] = prevContext;
    }
  }

  transformParameter(parameter) {
    const prevContext = this[inStringContextSymbol];
    try {
      this[inStringContextSymbol] = parameter.in !== 'body';
      return this.transformSchemaLike(super.transformParameter(parameter));
    } finally {
      this[inStringContextSymbol] = prevContext;
    }
  }

  transformMediaType(mediaType) {
    const prevContext = this[inStringContextSymbol];
    const mediaTypeStr = this.transformPath[this.transformPath.length - 1];
    try {
      this[inStringContextSymbol] =
        mediaTypeStr === 'application/x-www-form-urlencoded'
        || mediaTypeStr === 'multipart/form-data'
        || mediaTypeStr === 'text/csv'
        || mediaTypeStr === 'text/plain';
      return super.transformMediaType(mediaType);
    } finally {
      this[inStringContextSymbol] = prevContext;
    }
  }
}
