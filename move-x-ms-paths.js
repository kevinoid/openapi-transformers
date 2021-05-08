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

function moveXMsPaths(spec) {
  const queryPaths = Object.keys(spec.paths)
    .filter((path) => path.includes('?'));

  if (queryPaths.length === 0) {
    return spec;
  }

  const paths = { ...spec.paths };
  const xMsPaths = { ...spec['x-ms-paths'] };
  for (const path of queryPaths) {
    assert(
      !hasOwnProperty.call(xMsPaths, path),
      `${path} already present in x-ms-paths`,
    );
    xMsPaths[path] = paths[path];
    delete paths[path];
  }

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
