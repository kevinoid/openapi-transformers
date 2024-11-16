/**
 * @copyright Copyright 2019 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 * @module "openapi-transformers/remove-paths-with-servers.js"
 */

import OpenApiTransformerBase from 'openapi-transformer-base';

/**
 * Transformer to remove Path Item Objects which have servers (and therefore
 * can't be represented in OpenAPI 2).
 */
export default class RemovePathsWithServersTransformer
  extends OpenApiTransformerBase {
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
