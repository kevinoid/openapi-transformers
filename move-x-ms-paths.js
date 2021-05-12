/**
 * @copyright Copyright 2019 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 * @module "openapi-transformers/move-x-ms-paths.js"
 */

import assert from 'assert';

import OpenApiTransformerBase from 'openapi-transformer-base';

/**
 * Transformer to move paths with query parameters from paths to x-ms-paths for
 * Autorest.
 *
 * https://github.com/Azure/autorest/tree/master/docs/extensions#x-ms-paths
 *
 * This is used to work around lack of support for multiple operations with the
 * same path and method:
 * https://github.com/OAI/OpenAPI-Specification/issues/791
 *
 * Putting query in path is not allowed by any current version of OpenAPI
 * https://github.com/OAI/OpenAPI-Specification/issues/468#issuecomment-142393969
 * but it has the benefit of working with lots of tooling without support for
 * x-ms-paths (e.g. for linting, docs generation, etc.)
 */
export default class MoveXMsPathsTransformer
  extends OpenApiTransformerBase {
  // Override as performance optimization, since only transforming paths
  // eslint-disable-next-line class-methods-use-this
  transformOpenApi(spec) {
    if (!spec || !spec.paths) {
      return spec;
    }

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
}
