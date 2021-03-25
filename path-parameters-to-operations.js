#!/usr/bin/env node
/**
 * Script to move parameters defined on Path Item Objects to the beginning of
 * the parameters array of the Operation Objects so that they will be generated
 * in the desired order (path-first).
 *
 * @copyright Copyright 2019 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

'use strict';

const OpenApiTransformerBase = require('openapi-transformer-base');
const { readFile, writeFile } = require('./lib/file-utils.js');

const PATH_METHODS = [
  'delete',
  'get',
  'head',
  'options',
  'patch',
  'post',
  'put',
  'trace',
];

class PathParametersToOperationTransformer extends OpenApiTransformerBase {
  // eslint-disable-next-line class-methods-use-this
  transformPathItem(pathItem) {
    if (!Array.isArray(pathItem.parameters)
        || pathItem.parameters.length === 0) {
      return pathItem;
    }

    const {
      parameters,
      ...newPathItem
    } = pathItem;
    for (const method of PATH_METHODS) {
      if (hasOwnProperty.call(pathItem, method)) {
        const operation = pathItem[method];
        const opParams = operation.parameters;
        newPathItem[method] = {
          ...operation,
          // TODO: Operation parameters can override path parameters (where
          // .name and .in match).  Either can be $ref.  Handle these.
          parameters:
            !Array.isArray(opParams) || opParams.length === 0 ? parameters
              : [...parameters, ...opParams],
        };
      }
    }

    return newPathItem;
  }

  // Performance optimization:  Only need to transform paths.
  transformOpenApi(spec) {
    return {
      ...spec,
      paths: this.transformPaths(spec.paths),
    };
  }
}

module.exports = PathParametersToOperationTransformer;

function pathParametersToOperationInSpec(spec, options) {
  const transformer = new PathParametersToOperationTransformer(options);
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
    .then((v3SpecStr) => pathParametersToOperationInSpec(
      JSON.parse(v3SpecStr),
    ))
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
