/**
 * Script to move parameters with x-ms-parameter-location:client defined on
 * Path Item Objects and Operation Objects to the Components or Definitions
 * Object (which is required for x-ms-parameter-location to have any effect).
 *
 * Note: Authors should define such parameters in Components or Definitions.
 * This script is mostly a workaround for api-spec-converter, which inlines
 * all $ref parameters.
 * https://github.com/Azure/autorest/tree/master/docs/extensions#x-ms-parameter-location
 *
 * @copyright Copyright 2020 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

'use strict';

// Any unique, deterministic stringify function would work.
// TODO: Benchmark against native JSON.stringify result of sort-keys deep
// https://github.com/sindresorhus/hash-obj/blob/master/index.js#L17
// https://github.com/epoberezkin/fast-json-stable-stringify#benchmark
const stringify = require('fast-json-stable-stringify');

const OpenApiTransformerBase = require('openapi-transformer-base');

const parametersSymbol = Symbol('parameters');
const parametersMapSymbol = Symbol('parametersMap');
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

function parameterToKey(parameter) {
  // Autorest treats global parameters as properties on the client by default.
  // Remove x-ms-parameter-location:client to combine parameters which only
  // differ by this property.
  if (parameter['x-ms-parameter-location'] === 'client') {
    const { 'x-ms-parameter-location': _, ...paramNoLoc } = parameter;
    parameter = paramNoLoc;
  }

  return stringify(parameter);
}

function buildParametersMap(parameters) {
  const parametersMap = new Map();
  for (const paramName of Object.keys(parameters)) {
    const parameter = parameters[paramName];
    if (parameter) {
      parametersMap.set(
        parameterToKey(parameter),
        encodeJsonPointerComponent(paramName),
      );
    }
  }
  return parametersMap;
}

function getUnusedPropName(obj, propName) {
  if (!hasOwnProperty.call(obj, propName)) {
    return propName;
  }

  for (let i = 0; ; i += 1) {
    if (!hasOwnProperty.call(obj, propName + i)) {
      return propName + i;
    }
  }
}

class ClientParamsToGlobalTransformer extends OpenApiTransformerBase {
  transformParameter(parameter) {
    if (!parameter || parameter['x-ms-parameter-location'] !== 'client') {
      return parameter;
    }

    const parametersMap = this[parametersMapSymbol];
    const parameterStr = parameterToKey(parameter);
    let paramNameEncoded = parametersMap.get(parameterStr);
    if (paramNameEncoded === undefined) {
      const parameters = this[parametersSymbol];
      const paramName = getUnusedPropName(parameters, String(parameter.name));
      parameters[paramName] = parameter;
      paramNameEncoded = encodeJsonPointerComponent(paramName);
      parametersMap.set(parameterStr, paramNameEncoded);
    }

    return {
      $ref: this[parametersPathSymbol] + paramNameEncoded,
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
      this[parametersSymbol] = newParameters;
      this[parametersMapSymbol] = buildParametersMap(newParameters);
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
      this[parametersSymbol] = newParameters;
      this[parametersMapSymbol] = buildParametersMap(newParameters);
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

module.exports = ClientParamsToGlobalTransformer;
