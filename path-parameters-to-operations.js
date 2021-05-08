/**
 * Script to move parameters defined on Path Item Objects to the beginning of
 * the parameters array of the Operation Objects so that they will be generated
 * in the desired order (path-first).
 *
 * @copyright Copyright 2019 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import OpenApiTransformerBase from 'openapi-transformer-base';

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

// eslint-disable-next-line import/no-unused-modules
export default class PathParametersToOperationTransformer
  extends OpenApiTransformerBase {
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
