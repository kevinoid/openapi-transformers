#!/usr/bin/env node
/**
 * Remove Path Item Objects which have servers (and therefore can't be
 * represented in OpenAPI 2).
 *
 * @copyright Copyright 2019 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

'use strict';

const OpenApiTransformerBase = require('openapi-transformer-base');
const { readFile, writeFile } = require('./lib/file-utils.js');

class RemovePathsWithServers extends OpenApiTransformerBase {
  // eslint-disable-next-line class-methods-use-this
  transformPaths(paths) {
    return Object.keys(paths)
      .reduce((newPaths, path) => {
        const pathItem = paths[path];
        if (!pathItem.servers) {
          newPaths[path] = pathItem;
        }
        return newPaths;
      }, Object.create(Object.getPrototypeOf(paths)));
  }

  // Optimization: Only transform paths
  transformOpenApi(spec) {
    return {
      ...spec,
      paths: this.transformPaths(spec.paths),
    };
  }
}

module.exports = RemovePathsWithServers;

function removePathsWithServers(spec) {
  const transformer = new RemovePathsWithServers();
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
    .then((specStr) => removePathsWithServers(JSON.parse(specStr)))
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
