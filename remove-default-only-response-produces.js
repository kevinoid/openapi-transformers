/**
 * @copyright Copyright 2020 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import OpenApiTransformerBase from 'openapi-transformer-base';

/**
 * Transformer to remove produces from operations with only a default response.
 *
 * If an operation only produces non-JSON types and only has a default response
 * code, Autorest (core 2.0.4413 and 3.0.6246) will generate methods which do
 * not return a value.  If the operation does not produce any types, Autorest
 * will generate a method which returns the response value (e.g. Stream for
 * type: file).
 */
export default class RemoveDefaultOnlyResponseProducesTransformer
  extends OpenApiTransformerBase {
  // eslint-disable-next-line class-methods-use-this
  transformOperation(operation) {
    if (!operation || !operation.responses) {
      return operation;
    }

    const codes = Object.keys(operation.responses);
    if (codes.length !== 1 || codes[0] !== 'default') {
      return operation;
    }

    return {
      ...operation,
      // Note: empty produces is required to override global produces (if any)
      produces: [],
    };
  }

  transformOpenApi(openApi) {
    // There is no way to remove response media types in OpenAPI 3 without
    // removing the schema type (which is what we are trying to return).
    if (!openApi || openApi.swagger !== '2.0') {
      throw new Error(
        `${this.constructor.name} can only be applied to OpenAPI 2.0 documents`,
      );
    }

    // Optimization: not calling super.transformOpenApi since only .paths
    // needs to be transformed.
    if (openApi.paths === undefined) {
      return openApi;
    }

    return {
      ...openApi,
      paths: this.transformPaths(openApi.paths),
    };
  }
}
