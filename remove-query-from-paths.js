/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 * @module "openapi-transformers/remove-query-from-paths.js"
 */

import { METHODS } from 'node:http';
import { isDeepStrictEqual } from 'node:util';

import OpenApiTransformerBase from 'openapi-transformer-base';
import visit from 'openapi-transformer-base/visit.js';

const oasVersionSymbol = Symbol('openApiVersion');
const pathVarNameToParamsSymbol = Symbol('pathVarNameToParams');

const httpMethodSet = new Set(METHODS);

function isArrayEqual(array1, array2) {
  if (array1 === undefined) {
    array1 = [];
  }
  if (array2 === undefined) {
    array2 = [];
  }
  return isDeepStrictEqual(array1, array2);
}

function valueToType(value) {
  const type = typeof value;
  if (value === undefined || type === 'symbol') {
    throw new TypeError(`${type} type not available in JSON Schema`);
  }

  return type === 'number' && value % 1 === 0 ? 'integer'
    : value === null ? 'null'
      : type;
}

function createConstQueryParam(name, value) {
  const oasVersion = this[oasVersionSymbol];

  if (oasVersion.startsWith('2.')) {
    return {
      name,
      in: 'query',
      required: true,
      type: valueToType(value),
      enum: [value],
    };
  }

  if (oasVersion.startsWith('3.0')) {
    return {
      name,
      in: 'query',
      required: true,
      schema: {
        enum: [value],
      },
    };
  }

  return {
    name,
    in: 'query',
    required: true,
    schema: {
      const: value,
    },
  };
}

// FIXME: How to handle unpaired {}
// FIXME: How to handle = in {}
// FIXME: How to handle %-encoded characters in {}
// FIXME: How to handle missing variable name (e.g. /a/{}/b)
function parseQueryParams(query) {
  const ampQuery = `&${query}`;
  const paramValueRE =
    /&([^{}&=]*(?:\{[^{}]*\}[^{}&=]*)*)(?:=([^{}&]*(?:\{[^{}]*\}[^{}&]*)*))?/y;
  const paramMap = new Map();
  let paramValueMatch;
  while (paramValueRE.lastIndex < ampQuery.length
    // eslint-disable-next-line no-cond-assign
    && (paramValueMatch = paramValueRE.exec(ampQuery)) !== null) {
    if (paramValueMatch[0] === '&') {
      // Nothing after &
      continue;
    }

    const param = paramValueMatch[1];
    const pvarStart = param.indexOf('{');
    const pvarEnd = param.indexOf('}');
    if (pvarStart > 0) {
      if (pvarEnd > pvarStart) {
        this.warn('Unable to handle query param with variable name', param);
      } else {
        this.warn('Unpaired "{" in query param name', param);
      }

      return undefined;
    }

    if (pvarEnd >= 0) {
      this.warn('Unpaired "}" in query param name', param);
      return undefined;
    }

    const value = paramValueMatch[2] || '';
    const qvarStart = value.indexOf('{');
    const qvarEnd = value.indexOf('}');
    if (qvarStart > 0 || (qvarStart === 0 && qvarEnd !== value.length - 1)) {
      this.warn(
        'Unable to handle query value with constant and variable parts',
        value,
      );
      return undefined;
    }

    if (qvarEnd < qvarStart) {
      this.warn(
        'Unpaired "%s" in query value',
        qvarEnd >= 0 ? '}' : '{',
        param,
      );
      return undefined;
    }

    // TODO: Convert to param with `type: array` and `explode: true`?
    if (paramMap.has(param)) {
      this.warn('Ignoring path with duplicate query parameter', param);
      return undefined;
    }

    paramMap.set(param, value);
  }

  if (paramValueRE.lastIndex !== ampQuery.length) {
    this.warn('Unable to parse query parameters', query);
    return undefined;
  }

  return paramMap;
}

function combineParameters(opParams, pathParams) {
  if (opParams === undefined) {
    return pathParams;
  }

  if (!Array.isArray(opParams)) {
    return opParams;
  }

  if (opParams.length === 0) {
    return pathParams;
  }

  return [
    ...opParams,
    ...pathParams
      // Don't include params from Path Item overridden by Operation
      .filter((pp) => pp && !opParams.some((op) => op
        && op.name === pp.name
        && op.in === pp.in)),
  ];
}

function moveParameters(pathItem) {
  const { parameters, ...newPathItem } = pathItem;
  if (parameters === undefined
    || (Array.isArray(parameters) && parameters.length === 0)) {
    return pathItem;
  }

  for (const [method, operation] of Object.entries(pathItem)) {
    if (operation !== null
      && typeof operation === 'object'
      && httpMethodSet.has(method.toUpperCase())) {
      newPathItem[method] = {
        ...operation,
        parameters: combineParameters(operation.parameters, parameters),
      };
    }
  }

  return newPathItem;
}

function moveServers(pathItem) {
  const { servers, ...newPathItem } = pathItem;
  if (servers === undefined
    || (Array.isArray(servers) && servers.length === 0)) {
    return pathItem;
  }

  for (const [method, operation] of Object.entries(pathItem)) {
    if (operation !== null
      && typeof operation === 'object'
      && operation.servers === undefined
      && httpMethodSet.has(method.toUpperCase())) {
      newPathItem[method] = {
        ...operation,
        servers,
      };
    }
  }

  return newPathItem;
}

function mergePathItems(pathItem1, pathItem2) {
  if (!isArrayEqual(pathItem1.parameters, pathItem2.parameters)) {
    // TODO: Keep common parameters at Path Item level
    pathItem1 = moveParameters(pathItem1);
    pathItem2 = moveParameters(pathItem2);
  }

  if (!isArrayEqual(pathItem1.servers, pathItem2.servers)) {
    pathItem1 = moveServers(pathItem1);
    pathItem2 = moveServers(pathItem2);
  }

  const combined = { ...pathItem2 };
  for (const [prop, value1] of Object.entries(pathItem1)) {
    if (value1 !== undefined
      && prop !== 'parameters'
      && prop !== 'servers') {
      const value2 = pathItem2[prop];
      if (value2 !== undefined && !isDeepStrictEqual(value1, value2)) {
        this.transformPath.push(prop);
        this.warn(
          'Refusing to overwrite %o with %o',
          value2,
          value1,
        );
        this.transformPath.pop();
        return undefined;
      }

      combined[prop] = value1;
    }
  }

  return combined;
}

function transformParameters(parameters) {
  const pathVarNameToParams = this[pathVarNameToParamsSymbol];
  return parameters.flatMap((param) => {
    if (param === null
      || typeof param !== 'object'
      || param.in !== 'path') {
      return param;
    }

    const newParams = pathVarNameToParams.get(param.name);
    if (newParams === undefined) {
      return param;
    }

    return newParams
      .map((newParam) => ({ ...param, ...newParam }))
      // If the parameter already exists, avoid duplicating it
      .filter((newParam) => !parameters.some((p) => p
        && p !== param
        && p.name === newParam.name
        && p.in === newParam.in));
  });
}

/** Remove query component of path in paths object.
 *
 * Including the query portion of a URL in path is not allowed in any current
 * version of OpenAPI
 * https://github.com/OAI/OpenAPI-Specification/issues/468#issuecomment-142393969
 * but some authors include it for various reasons.
 *
 * Operations which would conflict with existing operations on the same path
 * (excluding query parameters) are left unchanged.
 * See QueriesToXMsPathsTransformer for another way to handle these.
 */
export default class RemoveQueryFromPathsTransformer
  extends OpenApiTransformerBase {
  constructor() {
    super();
    this[oasVersionSymbol] = undefined;
    this[pathVarNameToParamsSymbol] = undefined;
  }

  transformOperation(operation) {
    if (typeof operation !== 'object'
      || operation === null
      || Array.isArray(operation)) {
      this.warn('Ignoring non-object Operation', operation);
      return operation;
    }

    const { parameters } = operation;
    if (!Array.isArray(parameters) || parameters.length === 0) {
      if (parameters !== undefined && !Array.isArray(parameters)) {
        this.warn('Ignoring non-Array parameters', parameters);
      }

      return operation;
    }

    return {
      ...operation,
      parameters: visit(
        this,
        transformParameters,
        'parameters',
        parameters,
      ),
    };
  }

  transformPathItem(pathItem) {
    pathItem = super.transformPathItem(pathItem);
    if (typeof pathItem !== 'object'
      || pathItem === null
      || Array.isArray(pathItem)) {
      // Already warned by super.transformPathItem(pathItem)
      return pathItem;
    }

    const { parameters } = pathItem;
    if (!Array.isArray(parameters) || parameters.length === 0) {
      // Already warned by super.transformPathItem(pathItem)
      return pathItem;
    }

    return {
      ...pathItem,
      parameters: visit(
        this,
        transformParameters,
        'parameters',
        parameters,
      ),
    };
  }

  transformPaths(paths) {
    if (typeof paths !== 'object' || paths === null || Array.isArray(paths)) {
      this.warn('Ignoring non-object Paths', paths);
      return paths;
    }

    // RegExp to match a path with a query part and optionally fragment part
    // Careful to avoid matching ? or # in variable name as part of path
    // (OAS 3.1.0 is clear that they are disallowed, but some path templating
    // languages use ? in particular, so be prepared.)
    const pathRE =
      /^([^{?#]*(?:\{[^}]*\}[^{?#]*)*)\?([^{#]*(?:\{[^}]*\}[^{#]*)*)(#.*)?$/;
    const pathMatches = Object.keys(paths)
      .map((path) => pathRE.exec(path))
      .filter(Boolean);
    if (pathMatches.length === 0) {
      return paths;
    }

    paths = { ...paths };

    for (const [pathQuery, pathname, query, frag] of pathMatches) {
      const srcPathItem = paths[pathQuery];
      if (srcPathItem === undefined) {
        continue;
      }

      if (srcPathItem === null
        || typeof srcPathItem !== 'object'
        || Array.isArray(srcPathItem)) {
        this.transformPath.push(pathQuery);
        this.warn('Ignoring non-object Path Item', srcPathItem);
        this.transformPath.pop();
        continue;
      }

      if (srcPathItem.parameters !== undefined
        && !Array.isArray(srcPathItem.parameters)) {
        this.transformPath.push(pathQuery);
        this.warn('Ignoring path with non-Array parameters', srcPathItem);
        this.transformPath.pop();
        continue;
      }

      const dstPath = pathname + (frag || '');
      const dstPathItem = paths[dstPath];
      if (dstPathItem === null
        || (dstPathItem !== undefined && typeof dstPathItem !== 'object')
        || Array.isArray(dstPathItem)) {
        this.transformPath.push(dstPath);
        this.warn(
          'Refusing to overwrite non-object Path Item',
          dstPathItem,
        );
        this.transformPath.pop();
        continue;
      }

      let queryParams;
      this.transformPath.push(pathQuery);
      try {
        queryParams = parseQueryParams(query);
      } finally {
        this.transformPath.pop();
      }

      if (queryParams === undefined) {
        continue;
      }

      const constParameters = [];
      const pathVarNameToParams = new Map();
      for (const [name, value] of queryParams) {
        if (value[0] !== '{') {
          constParameters.push(createConstQueryParam.call(
            this,
            name,
            value,
          ));
        } else {
          const valueName = value.slice(1, -1);
          let params = pathVarNameToParams.get(valueName);
          if (params === undefined) {
            params = [];
            if (dstPath.includes(value)) {
              // parameter occurs in path and query parts
              params.push({ name: valueName, in: 'path' });
            }
            pathVarNameToParams.set(valueName, params);
          }
          params.push({ name, in: 'query' });
        }
      }

      let newPathItem = constParameters.length === 0 ? srcPathItem
        : {
          ...srcPathItem,
          parameters: combineParameters(
            srcPathItem.parameters,
            constParameters,
          ),
        };

      this[pathVarNameToParamsSymbol] = pathVarNameToParams;
      try {
        newPathItem = visit(
          this,
          this.transformPathItem,
          pathQuery,
          newPathItem,
        );
      } finally {
        this[pathVarNameToParamsSymbol] = undefined;
      }

      const mergedPathItem = dstPathItem === undefined ? newPathItem : visit(
        this,
        mergePathItems,
        dstPath,
        dstPathItem,
        newPathItem,
      );
      if (mergedPathItem !== undefined) {
        paths[dstPath] = mergedPathItem;
        delete paths[pathQuery];
      }
    }

    return paths;
  }

  // Override as performance optimization, since only transforming paths
  transformOpenApi(openApi) {
    if (openApi === null
      || typeof openApi !== 'object'
      || Array.isArray(openApi)) {
      this.warn('Ignoring non-object OpenAPI', openApi);
      return openApi;
    }

    let oasVersion = '3.1.0';
    if (openApi.openapi !== undefined) {
      const openapi = `${openApi.openapi}`;
      if (openapi.startsWith('3.')) {
        oasVersion = openapi;
      } else if (openapi === '3') {
        oasVersion = '3.0.0';
      } else {
        this.warn('Unrecognized OpenAPI version', openApi.openapi);
      }
    } else if (openApi.swagger !== undefined) {
      const swagger = `${openApi.swagger}`;
      if (swagger === '2.0' || swagger === '2') {
        oasVersion = '2.0';
      } else {
        this.warn('Unrecognized Swagger version', openApi.openapi);
      }
    } else {
      this.warn('Document missing OpenAPI and Swagger version', openApi);
    }

    if (openApi.paths !== undefined) {
      this[oasVersionSymbol] = oasVersion;
      try {
        openApi = {
          ...openApi,
          paths: visit(
            this,
            this.transformPaths,
            'paths',
            openApi.paths,
          ),
        };
      } finally {
        this[oasVersionSymbol] = undefined;
      }
    }

    return openApi;
  }
}
