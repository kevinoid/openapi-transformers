#!/usr/bin/env node
/**
 * Script to remove headers from Response objects in an OpenAPI 3 doc.
 *
 * This can be useful because Autorest generates strongly typed classes for
 * each response type, which can be an annoyance (especially if the default
 * error response has headers), particularly since x-ms-headers is not working
 * correctly: https://github.com/Azure/autorest/pull/3322
 *
 * @copyright Copyright 2019 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

'use strict';

const { readFile, writeFile } = require('./lib/file-utils.js');
const OpenApiTransformerBase = require('openapi-transformer-base');

class RemoveResponseHeadersTransformer extends OpenApiTransformerBase {
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
        responses: this.transformResponses(components.responses),
      };
    }

    return components;
  }
}

module.exports = RemoveResponseHeadersTransformer;

function removeResponseHeaders(spec) {
  const transformer = new RemoveResponseHeadersTransformer();
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
    .then((specStr) => removeResponseHeaders(JSON.parse(specStr)))
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
