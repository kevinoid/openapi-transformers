#!/usr/bin/env node
/**
 * Script to remove produces from operations with only a default response.
 *
 * If an operation only produces non-JSON types and only has a default response
 * code, Autorest (core 2.0.4413 and 3.0.6246) will generate methods which do
 * not return a value.  If the operation does not produce any types, Autorest
 * will generate a method which returns the response value (e.g. Stream for
 * type: file).
 *
 * @copyright Copyright 2020 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

'use strict';

const { readFile, writeFile } = require('./lib/file-utils.js');
const OpenApiTransformerBase = require('openapi-transformer-base');

class RemoveDefaultOnlyResponseProducesTransformer extends OpenApiTransformerBase {
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
        `${__filename} can only be applied to OpenAPI 2.0 documents`,
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

module.exports = RemoveDefaultOnlyResponseProducesTransformer;

function removeDefaultOnlyResponseProduces(spec) {
  const transformer = new RemoveDefaultOnlyResponseProducesTransformer();
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
    .then((specStr) => removeDefaultOnlyResponseProduces(
      JSON.parse(specStr),
    ))
    .then((spec) => writeFile(
      outputPathOrDesc,
      JSON.stringify(spec, undefined, 2),
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
