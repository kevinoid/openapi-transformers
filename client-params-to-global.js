/**
 * @copyright Copyright 2020 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 * @module "openapi-transformers/client-params-to-global.js"
 */

import OpenApiTransformerBase from 'openapi-transformer-base';

import MatchingParameterManager from './lib/matching-parameter-manager.js';

const parameterManagerSymbol = Symbol('parameterManager');
const parametersPathSymbol = Symbol('parametersPath');

/** Encodes a "reference token" (i.e. path segment) for use in a JSON Pointer
 * according to RFC 6901.
 *
 * @private
 * @param {string} pathSegment Path segment (i.e. reference token) to encode.
 * @returns {string} referenceToken encoded according to RFC 6901.
 */
function encodeJsonPointerComponent(pathSegment) {
  return pathSegment.replace(/~/g, '~0').replace(/\//g, '~1');
}

/**
 * Transformer to move parameters with x-ms-parameter-location:client defined on
 * Path Item Objects and Operation Objects to the Components or Definitions
 * Object (which is required for x-ms-parameter-location to have any effect).
 *
 * Note: Authors should define such parameters in Components or Definitions.
 * This script is mostly a workaround for api-spec-converter, which inlines
 * all $ref parameters.
 * https://github.com/Azure/autorest/tree/master/docs/extensions#x-ms-parameter-location
 */
export default class ClientParamsToGlobalTransformer
  extends OpenApiTransformerBase {
  transformParameter(parameter) {
    if (!parameter || parameter['x-ms-parameter-location'] !== 'client') {
      return parameter;
    }

    const defName = this[parameterManagerSymbol].add(parameter, parameter.name);
    return {
      $ref: this[parametersPathSymbol] + encodeJsonPointerComponent(defName),
    };
  }

  transformOpenApi(openApi) {
    if (typeof openApi !== 'object' || openApi === null || !openApi.paths) {
      return openApi;
    }

    const { components, openapi, paths } = openApi;
    if (/^3(?:\.|$)/.test(openapi)
      || (typeof components === 'object' && components !== null)) {
      const newParameters = { ...components && components.parameters };
      this[parameterManagerSymbol] =
        new MatchingParameterManager(newParameters);
      this[parametersPathSymbol] = '#/components/parameters/';

      return {
        ...openApi,
        components: {
          ...components,
          parameters: newParameters,
        },
        paths: this.transformPaths(paths),
      };
    }

    const { parameters, swagger } = openApi;
    if (/^2(?:\.|$)/.test(swagger)
      || (typeof parameters === 'object' && parameters !== null)) {
      const newParameters = { ...parameters };
      this[parameterManagerSymbol] =
        new MatchingParameterManager(newParameters);
      this[parametersPathSymbol] = '#/parameters/';

      return {
        ...openApi,
        parameters: newParameters,
        paths: this.transformPaths(openApi.paths),
      };
    }

    return openApi;
  }
}
