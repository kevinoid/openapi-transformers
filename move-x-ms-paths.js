#!/usr/bin/env node
/**
 * Script to move paths with query parameters from paths to x-ms-paths for
 * Autorest.
 *
 * https://github.com/Azure/autorest/tree/master/docs/extensions#x-ms-paths
 *
 * @copyright Copyright 2019 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

'use strict';

const assert = require('assert');
const { readFile, writeFile } = require('./lib/file-utils.js');

function moveXMsPaths(spec) {
  const queryPaths = Object.keys(spec.paths)
    .filter((path) => path.includes('?'));

  if (queryPaths.length === 0) {
    return spec;
  }

  const paths = { ...spec.paths };
  const xMsPaths = { ...spec['x-ms-paths'] };
  queryPaths.forEach((path) => {
    assert(
      !hasOwnProperty.call(xMsPaths, path),
      `${path} already present in x-ms-paths`,
    );
    xMsPaths[path] = paths[path];
    delete paths[path];
  });

  return {
    ...spec,
    paths,
    'x-ms-paths': xMsPaths,
  };
}

module.exports = function factory(options) {
  // TODO: Inherit from OpenApiTransformerBase
  return { transformOpenApi: moveXMsPaths };
};

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
    .then((specStr) => moveXMsPaths(JSON.parse(specStr)))
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
