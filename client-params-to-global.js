#!/usr/bin/env node
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

const { readFile, writeFile } = require('./lib/file-utils.js');
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
  Object.keys(parameters).forEach((paramName) => {
    const parameter = parameters[paramName];
    if (parameter) {
      parametersMap.set(
        parameterToKey(parameter),
        encodeJsonPointerComponent(paramName),
      );
    }
  });
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

    const { components, openapi } = openApi;
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
        paths: this.transformPaths(openApi.paths),
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

function clientParamsToGlobal(spec, options) {
  const transformer = new ClientParamsToGlobalTransformer(options);
  return transformer.transformOpenApi(spec);
}

function main(args, options, cb) {
  if (args[2] === '--help') {
    options.stdout.write(`Usage: ${args[1]} [input] [output]\n`);
    cb(0);
    return;
  }

  const inputPathOrDesc = !args[2] || args[2] === '-' ? 0 : args[2];
  const outputPathOrDesc = !args[3] || args[3] === '-' ? 1 : args[3];

  // eslint-disable-next-line promise/catch-or-return
  readFile(inputPathOrDesc, { encoding: 'utf8' })
    .then((v3SpecStr) => clientParamsToGlobal(JSON.parse(v3SpecStr)))
    .then((v2Spec) => writeFile(
      outputPathOrDesc,
      JSON.stringify(v2Spec, undefined, 2),
    ))
    .then(
      () => cb(0),  // eslint-disable-line promise/no-callback-in-promise
      (err) => {
        options.stderr.write(`${err.stack}\n`);
        cb(1);  // eslint-disable-line promise/no-callback-in-promise
      },
    );
}

if (require.main === module) {
  // This file was invoked directly.
  main(process.argv, process, (exitCode) => {
    process.exitCode = exitCode;
  });
}
