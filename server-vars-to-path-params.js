/**
 * @copyright Copyright 2019-2020 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 * @module "openapi-transformers/server-vars-to-path-params.js"
 */

import assert from 'node:assert';

// Note: Undocumented function which is part of the public API
// https://github.com/flitbit/json-ptr/issues/29
import { encodeUriFragmentIdentifier } from 'json-ptr';
import OpenApiTransformerBase from 'openapi-transformer-base';

import MatchingParameterManager from './lib/matching-parameter-manager.js';

/** Gets the longest common suffix of two strings.
 *
 * @private
 */
function commonSuffix(s1, s2) {
  let i = s1.length - 1;
  for (let j = s2.length - 1; i >= 0 && j >= 0; i -= 1, j -= 1) {
    if (s1[i] !== s2[j]) {
      break;
    }
  }

  return s1.slice(i + 1);
}

/** Get the path portion of a templated URL.
 *
 * @private
 */
function getPath(url) {
  // Note: url may be relative and lack scheme+authority
  // Note: Can't use new URL() due to [/?#] in variable names
  return url
    // Remove scheme+authority, if present
    .replace(/^(?:\{[^{}]*\}|[a-zA-Z_+.-])+:\/\/(?:\{[^{}]*\}|[^/{}])+/, '')
    // Remove query or fragment, if present
    .replace(/^((?:\{[^{}]*\}|[^{}?#])*)[?#].*$/, '$1');
}

/** Gets the common path segment suffix of the path part of all server URLs,
 * containing at least one template expression.
 *
 * @private
 */
function getCommonPathSuffix(servers) {
  // Common suffix of path part of URLs (may be in middle of template expr)
  const commonUrlSuffix = servers
    .map((server) => getPath(server.url))
    .reduce(commonSuffix);

  // Smallest suffix of commonUrlSuffix which begins on a path segment
  // (i.e. at beginning or after a slash) and includes all template exprs.
  const match = /(?:^|\/)[^/]*(?:\{[^{}]*\}[^{}]*)+$/.exec(commonUrlSuffix);
  return match ? match[0] : '';
}

function transformPaths(paths, serverPath, serverParams) {
  return Object.keys(paths)
    .reduce((newPaths, path) => {
      const pathItem = paths[path];
      const { parameters } = pathItem;
      newPaths[serverPath + path] = {
        parameters:
          parameters ? [...serverParams, ...parameters] : serverParams,
        ...pathItem,
      };
      return newPaths;
    }, Object.create(Object.getPrototypeOf(paths)));
}

/**
 * Transformer to convert Server Variables in path portion to Parameters on
 * Path Item Objects for use with OpenAPI 2.
 *
 * TODO: Roll this into OpenAPI 3 -> 2 conversion?
 */
export default class ServerVarsToPathParamsTransformer
  extends OpenApiTransformerBase {
  constructor({ omitDefault } = {}) {
    super();

    if (omitDefault !== undefined && !Array.isArray(omitDefault)) {
      throw new TypeError('options.omitDefault must be an Array');
    }

    this.options = {
      omitDefault: omitDefault || [],
    };
  }

  transformOpenApi(spec) {
    if (!spec || !spec.servers || spec.servers.length === 0) {
      return spec;
    }

    const pathSuffix = getCommonPathSuffix(spec.servers);
    if (!pathSuffix) {
      return spec;
    }

    const pathSuffixVarNames = pathSuffix
      .match(/\{[^{}]*\}/g)
      .map((templateExpr) => templateExpr.slice(1, -1));

    // Transform servers and get variables for common path suffix
    let pathSuffixVars;
    const newServers = spec.servers.map((server) => {
      const newUrl = server.url.replace(pathSuffix, '');

      // Separate path suffix variables from remaining server variables
      const variables = server.variables || {};
      let haveNewVars = false;
      const newVars = {};
      const suffixVars = {};
      for (const varName of Object.keys(variables)) {
        const variable = variables[varName];
        if (pathSuffixVarNames.includes(varName)) {
          // Variable in path suffix
          if (this.options.omitDefault.includes(varName)
            && Object.hasOwn(variable, 'default')) {
            const newVariable = { ...variable };
            delete newVariable.default;
            suffixVars[varName] = newVariable;
          } else {
            suffixVars[varName] = variable;
          }

          // Check if variable is also in remaining server URL
          if (newUrl.includes(`{${varName}}`)) {
            haveNewVars = true;
            newVars[varName] = variable;
          }
        } else {
          haveNewVars = true;
          newVars[varName] = variable;
        }
      }

      if (pathSuffixVars === undefined) {
        pathSuffixVars = suffixVars;
      } else {
        assert.deepStrictEqual(
          pathSuffixVars,
          suffixVars,
          'shared path variables must be the same in all servers',
        );
      }

      const newServer = { ...server };
      newServer.url = newUrl;

      if (haveNewVars) {
        newServer.variables = newVars;
      } else {
        delete newServer.variables;
      }

      return newServer;
    });

    // Note: Autorest treats parameters defined globally as properties of the
    // client, rather than the method, by default (which is what we want here).
    // https://github.com/Azure/autorest/tree/master/docs/extensions#x-ms-parameter-location
    let parameters, paramRefPrefix;
    if (spec.openapi) {
      parameters = { ...spec.components && spec.components.parameters };
      paramRefPrefix = ['components', 'parameters'];
    } else {
      parameters = { ...spec.parameters };
      paramRefPrefix = ['parameters'];
    }
    const paramManager = new MatchingParameterManager(parameters);

    const serverParamRefs = Object.keys(pathSuffixVars).map((name) => {
      const serverVar = pathSuffixVars[name];
      const serverParam = {
        name,
        in: 'path',
        required: true,
      };
      if (spec.openapi) {
        serverParam.schema = {
          type: 'string',
          ...serverVar,
        };

        if (Object.hasOwn(serverVar, 'description')) {
          serverParam.description = serverVar.description;
          delete serverParam.schema.description;
        }
      } else {
        serverParam.type = 'string';
        Object.assign(serverParam, serverVar);
      }

      const defName = paramManager.add(serverParam, name);
      return {
        $ref: encodeUriFragmentIdentifier([...paramRefPrefix, defName]),
      };
    });

    const newPathPrefix = pathSuffix.replace(/\/$/, '');
    const newSpec = {
      ...spec,
      servers: newServers,
      paths: transformPaths(spec.paths, newPathPrefix, serverParamRefs),
    };

    if (spec.openapi) {
      newSpec.components = {
        ...spec.components,
        parameters,
      };
    } else {
      newSpec.parameters = parameters;
    }

    return newSpec;
  }
}
