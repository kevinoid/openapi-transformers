/**
 * @copyright Copyright 2019 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 * @module "openapi-transformers/remove-response-headers.js"
 */

import OpenApiTransformerBase from 'openapi-transformer-base';

/**
 * Transformer to remove headers from Response objects in an OpenAPI 3 doc.
 *
 * This can be useful because Autorest generates strongly typed classes for
 * each response type, which can be an annoyance (especially if the default
 * error response has headers), particularly since x-ms-headers is not working
 * correctly: https://github.com/Azure/autorest/pull/3322
 */
export default class RemoveResponseHeadersTransformer
  extends OpenApiTransformerBase {
  // eslint-disable-next-line class-methods-use-this
  transformResponse(response) {
    if (response.headers) {
      const newResponse = { ...response };
      delete newResponse.headers;
      return newResponse;
    }

    return response;
  }

  // Optimization: Only need to transform responses
  transformComponents(components) {
    if (components.responses) {
      return {
        ...components,
        responses:
          this.transformMap(components.responses, this.transformResponse),
      };
    }

    return components;
  }
}
