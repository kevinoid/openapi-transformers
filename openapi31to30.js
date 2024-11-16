/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 * @module "openapi-transformers/openapi31to30.js"
 */

import OpenApiTransformerBase from 'openapi-transformer-base';

import ConstToEnumTransformer from './const-to-enum.js';
import ExclusiveMinMaxToBoolTransformer from './exclusive-min-max-to-bool.js';
import PatternPropertiesToAdditionalPropertiesTransformer
  from './pattern-properties-to-additional-properties.js';
import RemoveTypeIfTransformer, { allNonNullTypes } from './remove-type-if.js';
import TypeNullToEnumTransformer from './type-null-to-enum.js';
import TypeNullToNullableTransformer from './type-null-to-nullable.js';

/**
 * Transformer to convert an OpenAPI 3.1.* document to OpenAPI 3.0.3.
 */
export default class OpenApi31To30Transformer extends OpenApiTransformerBase {
  constructor() {
    super();
    this.transformers = [
      new ExclusiveMinMaxToBoolTransformer(),
      new ConstToEnumTransformer(),
      new TypeNullToEnumTransformer(),
      new TypeNullToNullableTransformer(),
      new RemoveTypeIfTransformer(allNonNullTypes),
      new PatternPropertiesToAdditionalPropertiesTransformer(),
    ];
  }

  transformOpenApi(openApi) {
    if (typeof openApi !== 'object'
      || openApi === null
      || Array.isArray(openApi)) {
      this.warn('Ignoring non-object OpenAPI', openApi);
      return openApi;
    }

    if (typeof openApi.openapi !== 'string'
      || !openApi.openapi.startsWith('3.1.')) {
      this.warn('Expected OpenAPI 3.1, got', openApi.openapi);
    }

    for (const transformer of this.transformers) {
      openApi = transformer.transformOpenApi(openApi);
    }

    return {
      ...openApi,
      openapi: '3.0.3',
    };
  }
}
