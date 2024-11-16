/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 * @module "openapi-transformers/rename-components.js"
 */

// Note: Undocumented functions which are part of the public API:
// https://github.com/flitbit/json-ptr/issues/29
import {
  decodeUriFragmentIdentifier,
  encodeUriFragmentIdentifier,
} from 'json-ptr';
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
    if (Object.hasOwn(newObj, newKey)) {
      throw new Error(
        `New name ${newKey} for ${key} conflicts with existing name`,
      );
    }
    newObj[newKey] = value;
  }

  return newObj;
}

function isJsonRef(obj) {
  return obj && typeof obj.$ref === 'string';
}

function renameRefObj(obj, getPathIndex, renameFunc) {
  if (!renameFunc) {
    return obj;
  }

  const { $ref } = obj;
  if ($ref[0] !== '#') {
    return obj;
  }

  let tokens;
  try {
    tokens = decodeUriFragmentIdentifier($ref);
  } catch {
    return obj;
  }

  const renameInd = getPathIndex(tokens);
  if (renameInd < 0 || renameInd >= tokens.length) {
    return obj;
  }

  const name = tokens[renameInd];
  const newName = renameFunc(name);
  if (newName !== name) {
    tokens[renameInd] = newName;
    return {
      ...obj,
      $ref: encodeUriFragmentIdentifier(tokens),
    };
  }

  return obj;
}

/**
 * Transformer to rename components.
 */
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
    if (isJsonRef(example)) {
      return renameRefObj(
        example,
        (pp) => (pp[0] === 'components' && pp[1] === 'examples' ? 2 : -1),
        this[renameFuncsSymbol].examples,
      );
    }

    return super.transformExample3(example);
  }

  transformSchema(schema) {
    if (isJsonRef(schema)) {
      return renameRefObj(
        schema,
        (pp) => (pp[0] === 'components' && pp[1] === 'schemas' ? 2
          : pp[0] === 'definitions' ? 1 : -1),
        this[renameFuncsSymbol].schemas,
      );
    }

    return super.transformSchema(schema);
  }

  transformHeader(header) {
    if (isJsonRef(header)) {
      return renameRefObj(
        header,
        (pp) => (pp[0] === 'components' && pp[1] === 'headers' ? 2 : -1),
        this[renameFuncsSymbol].headers,
      );
    }

    return super.transformHeader(header);
  }

  transformLink(link) {
    if (isJsonRef(link)) {
      return renameRefObj(
        link,
        (pp) => (pp[0] === 'components' && pp[1] === 'links' ? 2 : -1),
        this[renameFuncsSymbol].links,
      );
    }

    return super.transformLink(link);
  }

  transformResponse(response) {
    if (isJsonRef(response)) {
      return renameRefObj(
        response,
        (pp) => (pp[0] === 'components' && pp[1] === 'responses' ? 2 : -1),
        this[renameFuncsSymbol].responses,
      );
    }

    return super.transformResponse(response);
  }

  transformParameter(parameter) {
    if (isJsonRef(parameter)) {
      return renameRefObj(
        parameter,
        (pp) => (pp[0] === 'components' && pp[1] === 'parameters' ? 2 : -1),
        this[renameFuncsSymbol].parameters,
      );
    }

    return super.transformParameter(parameter);
  }

  transformCallback(callback) {
    if (isJsonRef(callback)) {
      return renameRefObj(
        callback,
        (pp) => (pp[0] === 'components' && pp[1] === 'callbacks' ? 2 : -1),
        this[renameFuncsSymbol].callbacks,
      );
    }

    return super.transformCallback(callback);
  }

  transformRequestBody(requestBody) {
    if (isJsonRef(requestBody)) {
      return renameRefObj(
        requestBody,
        (pp) => (pp[0] === 'components' && pp[1] === 'requestBodies' ? 2 : -1),
        this[renameFuncsSymbol].requestBodies,
      );
    }

    return super.transformRequestBody(requestBody);
  }

  transformSecurityRequirement(securityRequirement) {
    return renameProps(
      super.transformSecurityRequirement(securityRequirement),
      this[renameFuncsSymbol].securitySchemes,
    );
  }

  transformPathItem(pathItem) {
    if (isJsonRef(pathItem)) {
      return renameRefObj(
        pathItem,
        (pp) => (pp[0] === 'components' && pp[1] === 'pathItems' ? 2 : -1),
        this[renameFuncsSymbol].pathItems,
      );
    }

    return super.transformPathItem(pathItem);
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
