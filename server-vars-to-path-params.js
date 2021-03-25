#!/usr/bin/env node
/**
 * Convert Server Variables in path portion to Parameters on Path Item Objects
 * for use with OpenAPI 2.
 *
 * TODO: Roll this into OpenAPI 3 -> 2 conversion?
 *
 * @copyright Copyright 2019-2020 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

'use strict';

const assert = require('assert');

const { readFile, writeFile } = require('./lib/file-utils.js');
const OpenApiTransformerBase = require('openapi-transformer-base');

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
    .replace(/^(?:\{[^{}]*\}|[a-zA-Z_+.-]+)+:\/\/(?:\{[^{}]*\}|[^/{}]+)+/, '')
    // Remove query or fragment, if present
    .replace(/^((?:\{[^{}]*\}|[^{}]+)*)[?#].*$/, '$1');
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
      newPaths[serverPath + path] = {
        parameters: serverParams.concat(pathItem.parameters || []),
        ...pathItem,
      };
      return newPaths;
    }, Object.create(Object.getPrototypeOf(paths)));
}

class ServerVarsToPathParamsTransformer extends OpenApiTransformerBase {
  constructor(options) {
    super();
    this.options = options;
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
      Object.keys(variables).forEach((varName) => {
        const variable = variables[varName];
        if (pathSuffixVarNames.includes(varName)) {
          // Variable in path suffix
          if (this.options.omitDefaults.includes(varName)
            && hasOwnProperty.call(variable, 'default')) {
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
      });

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
    if (spec.components) {
      parameters = { ...spec.components.parameters };
      paramRefPrefix = '#/components/parameters/';
    } else {
      parameters = { ...spec.parameters };
      paramRefPrefix = '#/parameters/';
    }

    const serverParamRefs = Object.keys(pathSuffixVars).map((name) => {
      const serverVar = pathSuffixVars[name];
      const serverParam = {
        name,
        in: 'path',
        required: true,
        schema: {
          type: 'string',
          ...serverVar,
        },
      };
      if (hasOwnProperty.call(serverVar, 'description')) {
        serverParam.description = serverVar.description;
        delete serverParam.schema.description;
      }
      if (hasOwnProperty.call(parameters, name)) {
        throw new Error(
          `Server variable ${name} conflicts with parameter of same name.`,
        );
      }
      parameters[name] = serverParam;
      return { $ref: paramRefPrefix + name };
    });

    const newPathPrefix = pathSuffix.replace(/\/$/, '');
    const newSpec = {
      ...spec,
      servers: newServers,
      paths: transformPaths(spec.paths, newPathPrefix, serverParamRefs),
    };

    if (spec.components) {
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

module.exports = ServerVarsToPathParamsTransformer;

function serverVarsToPathParams(spec, options) {
  const transformer = new ServerVarsToPathParamsTransformer(options);
  return transformer.transformOpenApi(spec);
}

function main(args, options, cb) {
  // TODO: Proper command-line parsing

  let i = 2;
  if (args[i] === '--help') {
    options.stdout.write(`Usage: ${args[1]} [options] [input] [output]\n`);
    cb(0);
    return;
  }

  const omitDefaults = [];
  while (args[i] === '-D' || args[i] === '--omit-default') {
    omitDefaults.push(args[i + 1]);
    i += 2;
  }

  const inputPathOrDesc = !args[i] || args[i] === '-' ? 0 : args[i];
  i += 1;
  const outputPathOrDesc = !args[i] || args[i] === '-' ? 1 : args[i];

  // eslint-disable-next-line promise/catch-or-return
  readFile(inputPathOrDesc, { encoding: 'utf8' })
    .then((specStr) => serverVarsToPathParams(
      JSON.parse(specStr),
      { ...options, omitDefaults },
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
