/**
 * @copyright Copyright 2019-2020 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 * @module "openapi-transformers/server-vars-to-x-ms-parameterized-host.js"
 */

import OpenApiTransformerBase from 'openapi-transformer-base';
import visit from 'openapi-transformer-base/visit.js';

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
    /^(?:(?:\{[^{}]*\}|[^/{}])*\/\/)?(?:\{[^{}]*\}|[^/{}])+/.exec(url);
  return match && match[0];
}

function parseServerUrl(url) {
  if (typeof url !== 'string') {
    this.warn('Ignoring Server with non-string url', url);
    return undefined;
  }

  const schemeAuth = getSchemeAuthority(url);
  if (!schemeAuth) {
    this.warn('Unable to determine scheme and authority for url', url);
    return undefined;
  }

  // Remove non-templated scheme, if present
  const hostTemplate = schemeAuth.replace(/^[a-zA-Z_+.-]+:\/\//, '');
  if (!hostTemplate) {
    this.warn('Unable to determine host for url', url);
    return undefined;
  }

  const hostTemplateExprs = hostTemplate.match(/\{[^{}]*\}/g);
  if (!hostTemplateExprs) {
    this.warn('No template expressions in scheme and authority for url', url);
    return undefined;
  }

  return {
    hostTemplate,
    // If non-templated scheme was removed, use the declared schemes
    useSchemePrefix: hostTemplate !== schemeAuth,
    hostTemplateVarNames: hostTemplateExprs
      .map((templateExpr) => templateExpr.slice(1, -1)),
  };
}

/**
 * Convert Server Variables in host portion to x-ms-parameterized-host for use
 * with OpenAPI 2.
 *
 * https://github.com/Azure/autorest/tree/main/docs/extensions#x-ms-parameterized-host
 *
 * TODO: Roll this into OpenAPI 3 -> 2 conversion?
 *
 * Note: Currently expects OAS3 input (required for Server Objects) but
 * produces OAS2 parameters as specified for x-ms-parameterized-host.
 */
export default class ServerVarsToParamHostTransformer
  extends OpenApiTransformerBase {
  constructor({ omitDefault, parameter, xMsParameterizedHost } = {}) {
    super();

    if (omitDefault !== undefined && !Array.isArray(omitDefault)) {
      throw new TypeError('options.omitDefault must be an Array');
    }

    if (parameter !== undefined
      && (parameter === null
        || typeof parameter !== 'object')) {
      throw new TypeError('options.parameter must be a object');
    }

    if (xMsParameterizedHost !== undefined
      && (xMsParameterizedHost === null
        || typeof xMsParameterizedHost !== 'object')) {
      throw new TypeError('options.xMsParameterizedHost must be a object');
    }

    this.options = {
      omitDefault: omitDefault || [],
      parameter,
      xMsParameterizedHost,
    };
  }

  transformServerVariableToParameter(serverVariable) {
    if (serverVariable === null
      || typeof serverVariable !== 'object'
      || Array.isArray(serverVariable)) {
      this.warn('Ignoring non-object Server Variable', serverVariable);
      return undefined;
    }

    return {
      name: undefined,
      type: 'string',
      ...serverVariable,
      in: 'path',
      required: true,
      ...this.options.parameter,
    };
  }

  transformServerVariablesToParameters(variables, varNames) {
    if (variables === null
      || typeof variables !== 'object'
      || Array.isArray(variables)) {
      this.warn('Ignoring non-object Map', variables);
      return undefined;
    }

    const parameters = [];
    for (const varName of varNames) {
      const variable =
        hasOwnProperty.call(variables, varName) ? variables[varName]
          : undefined;
      if (variable === undefined) {
        this.warn('Unable to convert Server missing variable %j', varName);
        return undefined;
      }

      const parameter = visit(
        this,
        this.transformServerVariableToParameter,
        varName,
        variable,
      );
      if (!parameter) {
        return undefined;
      }

      parameter.name = varName;

      if (this.options.omitDefault.includes(varName)
        && hasOwnProperty.call(parameter, 'default')) {
        delete parameter.default;
      }

      parameters.push(parameter);
    }

    return parameters;
  }

  transformServerToParameterizedHost(server) {
    if (server === null
      || typeof server !== 'object'
      || Array.isArray(server)) {
      this.warn('Ignoring non-object Server', server);
      return undefined;
    }

    const { url, variables = {} } = server;

    const urlParts = visit(this, parseServerUrl, 'url', url);
    if (!urlParts) {
      return undefined;
    }

    const {
      hostTemplate,
      useSchemePrefix,
      hostTemplateVarNames,
    } = urlParts;

    const parameters = visit(
      this,
      this.transformServerVariablesToParameters,
      'variables',
      variables,
      hostTemplateVarNames,
    );
    if (!parameters) {
      return undefined;
    }

    return {
      hostTemplate,
      useSchemePrefix,
      parameters,
      ...this.options.xMsParameterizedHost,
    };
  }

  transformServersToParameterizedHost(servers) {
    if (!Array.isArray(servers)) {
      this.warn('Ignoring non-Array servers', servers);
      return undefined;
    }

    if (servers.length === 0) {
      this.warn('Ignoring empty servers', servers);
      return undefined;
    }

    if (servers.length > 1) {
      this.warn('Ignoring all but first server', servers);
    }

    return visit(
      this,
      this.transformServerToParameterizedHost,
      '0',
      servers[0],
    );
  }

  transformOpenApi(openApi) {
    if (openApi === null
      || typeof openApi !== 'object'
      || Array.isArray(openApi)) {
      this.warn('Ignoring non-object OpenAPI', openApi);
      return openApi;
    }

    if (openApi.servers === undefined) {
      return openApi;
    }

    const parameterizedHost = visit(
      this,
      this.transformServersToParameterizedHost,
      'servers',
      openApi.servers,
    );
    if (parameterizedHost === undefined) {
      return openApi;
    }

    return {
      ...openApi,
      'x-ms-parameterized-host': parameterizedHost,
    };
  }
}
