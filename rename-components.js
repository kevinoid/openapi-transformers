/**
 * OpenAPI Transformer to rename components.
 *
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import OpenApiTransformerBase from 'openapi-transformer-base';

const renameFuncsSymbol = Symbol('renameFuncs');

// https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#fixed-fields-6
const componentFieldNames = [
  'schemas',
  'responses',
  'parameters',
  'examples',
  'requestBodies',
  'headers',
  'securitySchemes',
  'links',
  'callbacks',
  'pathItems',
];

/** Decodes a JSON Pointer token.
 *
 * @private
 * @param {string} token Encoded JSON Pointer token.
 * @returns {string} Decoded JSON Pointer token.
 */
function decodeToken(token) {
  return token.replace(/~1/g, '/').replace(/~0/g, '~');
}

/** Encodes a JSON Pointer token.
 *
 * @private
 * @param {string} token Decoded JSON Pointer token.
 * @returns {string} Encoded JSON Pointer token.
 */
function encodeToken(token) {
  return token.replace(/~/g, '~0').replace(/\//g, '~1');
}

/** Encodes a URI fragment.
 *
 * Encodes only characters not permitted by fragment production of RFC 3986
 * https://tools.ietf.org/html/rfc3986#appendix-A
 *
 * @private
 * @param {string} fragment Decoded portion of a URI after #.
 * @returns {string} Encoded portion of a URI after #.
 */
function encodeURIFragment(fragment) {
  return encodeURI(fragment)
    .replace(/#/g, '%23')
    .replace(/@/g, '%40')
    .replace(/:/g, '%3A');
}

function renameProps(obj, renameFunc) {
  if (!renameFunc
    || typeof obj !== 'object'
    || obj === null
    || Array.isArray(obj)) {
    return obj;
  }

  const newObj = {};
  for (const [key, value] of Object.entries(obj)) {
    const newKey = renameFunc(key);
    if (hasOwnProperty.call(newObj, newKey)) {
      throw new Error(
        `New name ${newKey} for ${key} conflicts with existing name`,
      );
    }
    newObj[newKey] = value;
  }

  return newObj;
}

function renameRefObj(jsonPtrRegexp, obj, renameFunc) {
  if (obj && renameFunc) {
    const { $ref } = obj;
    if (typeof $ref === 'string' && $ref[0] === '#') {
      try {
        // Note: json-ptr incorrectly decodes each slash-separated component
        // treating #/a%2Fb as ["a/b"] rather than ["a"]["b"].
        // It's also unclear if encode/decode funcs are part of public API
        // https://github.com/flitbit/json-ptr/issues/29
        const jsonPtr = decodeURIComponent($ref.slice(1));
        if (jsonPtrRegexp.test(jsonPtr)) {
          const tokens = jsonPtr.slice(1).split('/');
          const name = decodeToken(tokens[tokens.length - 1]);
          const newName = renameFunc(name);
          if (newName !== name) {
            tokens[tokens.length - 1] = encodeToken(newName);
            return {
              ...obj,
              $ref: `#/${encodeURIFragment(tokens.join('/'))}`,
            };
          }
        }
      } catch (errDecode) {
        // If $ref is not a valid URI, ignore it.
        // If an unexpected error occurred, re-throw.
        if (errDecode.name !== 'URIError') {
          throw errDecode;
        }
      }

      return obj;
    }
  }

  return undefined;
}

// eslint-disable-next-line import/no-unused-modules
export default class RenameComponentsTransformer
  extends OpenApiTransformerBase {
  constructor(options) {
    super();

    if (typeof options !== 'object' || options === null) {
      throw new TypeError('options must be an object');
    }

    const renameFuncs = {};
    for (const componentFieldName of componentFieldNames) {
      const renameFuncOrMap = options[componentFieldName];
      if (typeof renameFuncOrMap === 'function') {
        renameFuncs[componentFieldName] = renameFuncOrMap;
      } else if (typeof renameFuncOrMap === 'object') {
        const patterns = Object.entries(renameFuncOrMap)
          .map(([k, v]) => [new RegExp(k, 'g'), v]);
        renameFuncs[componentFieldName] = (name) => {
          for (const [pat, repl] of patterns) {
            if (pat.test(name)) {
              return name.replace(pat, repl);
            }
          }
          return name;
        };
      } else if (renameFuncOrMap !== undefined) {
        throw new TypeError(`options.${componentFieldName} must be a function`);
      }
    }

    this[renameFuncsSymbol] = renameFuncs;
  }

  transformExample3(example) {
    return renameRefObj(
      /^\/components\/examples\/[^/]*$/,
      example,
      this[renameFuncsSymbol].examples,
    ) || super.transformExample3(example);
  }

  transformSchema(schema) {
    return renameRefObj(
      /^\/(?:components\/schemas|definitions)\/[^/]*$/,
      schema,
      this[renameFuncsSymbol].schemas,
    ) || super.transformSchema(schema);
  }

  transformHeader(header) {
    return renameRefObj(
      /^\/components\/headers\/[^/]*$/,
      header,
      this[renameFuncsSymbol].headers,
    ) || super.transformHeader(header);
  }

  transformLink(link) {
    return renameRefObj(
      /^\/components\/links\/[^/]*$/,
      link,
      this[renameFuncsSymbol].links,
    ) || super.transformLink(link);
  }

  transformResponse(response) {
    return renameRefObj(
      /^\/components\/responses\/[^/]*$/,
      response,
      this[renameFuncsSymbol].responses,
    ) || super.transformResponse(response);
  }

  transformParameter(parameter) {
    return renameRefObj(
      /^\/components\/parameters\/[^/]*$/,
      parameter,
      this[renameFuncsSymbol].parameters,
    ) || super.transformParameter(parameter);
  }

  transformCallback(callback) {
    return renameRefObj(
      /^\/components\/callbacks\/[^/]*$/,
      callback,
      this[renameFuncsSymbol].callbacks,
    ) || super.transformCallback(callback);
  }

  transformRequestBody(requestBody) {
    return renameRefObj(
      /^\/components\/requestBodies\/[^/]*$/,
      requestBody,
      this[renameFuncsSymbol].requestBodies,
    ) || super.transformRequestBody(requestBody);
  }

  transformSecurityRequirement(securityRequirement) {
    return renameProps(
      super.transformSecurityRequirement(securityRequirement),
      this[renameFuncsSymbol].securitySchemes,
    );
  }

  transformPathItem(pathItem) {
    return renameRefObj(
      /^\/components\/pathItems\/[^/]*$/,
      pathItem,
      this[renameFuncsSymbol].pathItems,
    ) || super.transformPathItem(pathItem);
  }

  transformComponents(components) {
    components = super.transformComponents(components);

    if (typeof components !== 'object'
      || components === null
      || Array.isArray(components)) {
      return components;
    }

    const newComponents = { ...components };
    for (const [propName, renameFunc]
      of Object.entries(this[renameFuncsSymbol])) {
      const propValue = components[propName];
      if (propValue) {
        newComponents[propName] = renameProps(propValue, renameFunc);
      }
    }

    return newComponents;
  }

  transformOpenApi(openApi) {
    openApi = super.transformOpenApi(openApi);

    if (typeof openApi !== 'object'
      || openApi === null
      || Array.isArray(openApi)) {
      return openApi;
    }

    const { definitions } = openApi;
    const renameSchemas = this[renameFuncsSymbol].schemas;
    if (definitions && renameSchemas) {
      openApi = {
        ...openApi,
        definitions: renameProps(definitions, renameSchemas),
      };
    }

    return openApi;
  }
}
