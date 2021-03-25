#!/usr/bin/env node
/**
 * Convert Server Variables in host portion to x-ms-parameterized-host for use
 * with OpenAPI 2.
 *
 * https://github.com/Azure/autorest/tree/master/docs/extensions#x-ms-parameterized-host
 *
 * TODO: Roll this into OpenAPI 3 -> 2 conversion?
 *
 * @copyright Copyright 2019-2020 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

'use strict';

const assert = require('assert');

const OpenApiTransformerBase = require('openapi-transformer-base');
const { readFile, writeFile } = require('./lib/file-utils.js');

/** Gets the scheme and authority portions of a URL template.
 *
 * @private
 */
function getSchemeAuthority(url) {
  // Note: parameterized host may contain host and/or schema parameters.
  // A single parameter may contain both schema and host.
  // No way to disambiguate url like {schema}{host}{pathPrefix}.
  // Assume the scheme+authority parts end at first slash following //
  // (if present).  (Note: protocol-relative url may start with //)
  const match =
    /^((?:\{[^{}]*\}|[^/{}]+)*\/\/)?(?:\{[^{}]*\}|[^/{}]+)+/.exec(url);
  return match && match[0];
}

function serverVariableToParameter(name, serverVar) {
  const serverParam = {
    name,
    schema: {
      type: 'string',
    },
    ...serverVar,
    in: 'path',
    required: true,
  };

  if (hasOwnProperty.call(serverVar, 'enum')) {
    serverParam.schema.enum = serverVar.enum;
    delete serverParam.enum;
  }

  return serverParam;
}

class ServerVarsToParamHostTransformer extends OpenApiTransformerBase {
  constructor(options) {
    super();
    this.options = options;
  }

  transformOpenApi(spec) {
    if (!spec || !spec.servers || spec.servers.length === 0) {
      return spec;
    }

    let useSchemePrefix = false;
    const hostTemplate = spec.servers.reduce((hostTemplate1, server) => {
      const serverSchemeAuth = getSchemeAuthority(server.url);
      // Remove non-templated scheme, if present
      const serverHostTemplate =
        serverSchemeAuth.replace(/^[a-zA-Z_+.-]+:\/\//, '');
      if (hostTemplate1 !== undefined && serverHostTemplate !== hostTemplate1) {
        throw new Error(
          `Server hosts differ: ${serverHostTemplate} != ${hostTemplate1}`,
        );
      }
      // If scheme was removed, use the declared schemes
      useSchemePrefix = serverHostTemplate !== serverSchemeAuth;
      return serverHostTemplate;
    }, undefined);

    if (!hostTemplate) {
      // Host not found in servers.url
      return spec;
    }

    const hostTemplateExprs = hostTemplate.match(/\{[^{}]*\}/g);
    if (!hostTemplateExprs) {
      // No template expressions in scheme+authority
      return spec;
    }

    const hostTemplateVarNames = hostTemplateExprs
      .map((templateExpr) => templateExpr.slice(1, -1));

    // Get variables for scheme+authority
    let hostTemplateVars;
    for (const server of spec.servers) {
      const variables = server.variables || {};
      const serverHostTemplateVars = {};
      for (const varName of hostTemplateVarNames) {
        const variable = variables[varName];
        if (!variable) {
          throw new Error(`Variable {${varName}} in url, not in variables`);
        }

        if (this.options.omitDefaults.includes(varName)
          && hasOwnProperty.call(variable, 'default')) {
          const newVariable = { ...variable };
          delete newVariable.default;
          serverHostTemplateVars[varName] = newVariable;
        } else {
          serverHostTemplateVars[varName] = variable;
        }
      }

      if (hostTemplateVars === undefined) {
        hostTemplateVars = serverHostTemplateVars;
      } else {
        assert.deepStrictEqual(
          hostTemplateVars,
          serverHostTemplateVars,
          'shared host variables must be the same in all servers',
        );
      }
    }

    return {
      ...spec,
      'x-ms-parameterized-host': {
        hostTemplate,
        useSchemePrefix,
        positionInOperation: this.options.positionInOperation,
        parameters: hostTemplateVarNames
          .map((varName) => serverVariableToParameter(
            varName,
            hostTemplateVars[varName],
          )),
      },
    };
  }
}

module.exports = ServerVarsToParamHostTransformer;

function serverVarsToParamHost(spec, options) {
  const transformer = new ServerVarsToParamHostTransformer(options);
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
    .then((specStr) => serverVarsToParamHost(
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