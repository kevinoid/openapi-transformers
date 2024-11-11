/**
 * @copyright Copyright 2024 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

const { freeze } = Object;

/**
 * A minimal OpenAPI 3 document.
 */
export const openapi = freeze({
  openapi: '3.0.3',
  info: freeze({
    title: 'Title',
    version: '1.0',
  }),
  paths: freeze({}),
});
export const swagger = freeze({
  swagger: '2.0',
  info: freeze({
    title: 'Title',
    version: '1.0',
  }),
  paths: freeze({}),
});

/**
 * Creates an OpenAPI 2 (fka Swagger) document for a given Operation.
 *
 * @param {string} method HTTP method name.
 * @param {!object} operation OpenAPI 2 Operation.
 * @returns {!object} OpenAPI 2 document containing the given Operation for
 * the given method for path /.
 */
function op2(method, operation) {
  return {
    ...swagger,
    paths: {
      '/': {
        [method]: operation,
      },
    },
  };
}

/**
 * Creates an OpenAPI 3 document for a given Operation.
 *
 * @param {string} method HTTP method name.
 * @param {!object} operation OpenAPI 3 Operation.
 * @param {string=} version OpenAPI version.
 * @returns {!object} OpenAPI 3 document of the given version (or 3.0.3)
 * containing the given Operation for the given method for path /.
 */
function op3(method, operation, version) {
  return {
    ...openapi,
    openapi: version ?? openapi.openapi,
    paths: {
      '/': {
        [method]: operation,
      },
    },
  };
}

/**
 * Creates an OpenAPI 2 (fka Swagger) document for a given GET Operation.
 *
 * @param {!object} operation OpenAPI 2 Operation.
 * @returns {!object} OpenAPI 2 document containing the given Operation as GET
 * for path /.
 */
export function get2(operation) {
  return op2('get', operation);
}

/**
 * Creates an OpenAPI 3 document for a given GET Operation.
 *
 * @param {!object} operation OpenAPI 3 Operation.
 * @param {string=} version OpenAPI version.
 * @returns {!object} OpenAPI 3 document of the given version (or 3.0.3)
 * containing the given Operation as GET for path /.
 */
export function get3(operation, version) {
  return op3('get', operation, version);
}

/**
 * Creates an OpenAPI 2 (fka Swagger) document for a given POST Operation.
 *
 * @param {!object} operation OpenAPI 2 Operation.
 * @returns {!object} OpenAPI 2 document containing the given Operation as POST
 * for path /.
 */
export function post2(operation) {
  return op2('post', operation);
}

/**
 * Creates an OpenAPI 3 document for a given POST Operation.
 *
 * @param {!object} operation OpenAPI 3 Operation.
 * @param {string=} version OpenAPI version.
 * @returns {!object} OpenAPI 3 document of the given version (or 3.0.3)
 * containing the given Operation as POST for path /.
 */
export function post3(operation, version) {
  return op3('post', operation, version);
}

/**
 * Creates an OpenAPI 2 document for a given JSON response Schema.
 *
 * @param {!object} schema OpenAPI 2 Schema.
 * @returns {!object} OpenAPI 2 document containing the given Schema as
 * application/json default response for GET for path /.
 */
// eslint-disable-next-line import/no-unused-modules
export function responseSchema2(schema) {
  return {
    ...swagger,
    paths: {
      '/': {
        get: {
          produces: ['application/json'],
          responses: {
            default: {
              description: 'Example response',
              schema,
            },
          },
        },
      },
    },
  };
}

/**
 * Creates an OpenAPI 3 document for a given JSON response Schema.
 *
 * @param {!object} schema OpenAPI 3 Schema.
 * @param {string=} version OpenAPI version.
 * @returns {!object} OpenAPI 3 document of the given version (or 3.0.3)
 * containing the given Schema as application/json default response for GET for
 * path /.
 */
export function responseSchema3(schema, version) {
  return {
    ...openapi,
    openapi: version ?? openapi.openapi,
    paths: {
      '/': {
        get: {
          responses: {
            default: {
              description: 'Example response',
              content: {
                'application/json': {
                  schema,
                },
              },
            },
          },
        },
      },
    },
  };
}

/**
 * Creates an OpenAPI 2 (fka Swagger) document for a given Schema.
 *
 * @param {!object} schema OpenAPI 2 Schema.
 * @returns {!object} OpenAPI 2 document containing the given schema named Test.
 */
export function schema2(schema) {
  return {
    ...swagger,
    definitions: {
      Test: schema,
    },
  };
}

/**
 * Creates an OpenAPI 3 document for a given Schema.
 *
 * @param {!object} schema OpenAPI 3 Schema.
 * @param {string=} version OpenAPI version.
 * @returns {!object} OpenAPI 3 document of the given version (or 3.0.3)
 * containing the given schema named Test.
 */
export function schema3(schema, version) {
  return {
    ...openapi,
    openapi: version ?? '3.0.3',
    components: {
      schemas: {
        Test: schema,
      },
    },
  };
}
