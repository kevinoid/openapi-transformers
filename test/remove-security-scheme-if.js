/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'assert';
import deepFreeze from 'deep-freeze';

import RemoveSecuritySchemeIfTransformer from '../remove-security-scheme-if.js';

describe('RemoveSecuritySchemeIfTransformer', () => {
  it('throws TypeError without constructor argument', () => {
    assert.throws(
      () => new RemoveSecuritySchemeIfTransformer(),
      TypeError,
    );
  });

  it('throws TypeError with non-function constructor argument', () => {
    assert.throws(
      () => new RemoveSecuritySchemeIfTransformer(true),
      TypeError,
    );
  });

  describe('with OpenAPI 3', () => {
    it('removes only scheme from securitySchemes', () => {
      const myScheme = { type: 'apiKey', name: 'test', in: 'query' };
      let predicateCallCount = 0;
      assert.deepStrictEqual(
        new RemoveSecuritySchemeIfTransformer((securityScheme) => {
          predicateCallCount += 1;
          return securityScheme === myScheme;
        }).transformOpenApi(deepFreeze({
          openapi: '3.0.3',
          info: {
            title: 'Title',
            version: '1.0',
          },
          components: {
            securitySchemes: { myScheme },
          },
          paths: {},
        })),
        {
          openapi: '3.0.3',
          info: {
            title: 'Title',
            version: '1.0',
          },
          components: {},
          paths: {},
        },
      );

      assert.strictEqual(predicateCallCount, 1);
    });

    it('removes one scheme from securitySchemes', () => {
      const myScheme = { type: 'apiKey', name: 'test', in: 'query' };
      const otherScheme = { type: 'apiKey', name: 'test2', in: 'query' };
      let predicateCallCount = 0;
      assert.deepStrictEqual(
        new RemoveSecuritySchemeIfTransformer((securityScheme) => {
          predicateCallCount += 1;
          return securityScheme === myScheme;
        }).transformOpenApi(deepFreeze({
          openapi: '3.0.3',
          info: {
            title: 'Title',
            version: '1.0',
          },
          components: {
            securitySchemes: {
              myScheme,
              otherScheme,
            },
          },
          paths: {},
        })),
        {
          openapi: '3.0.3',
          info: {
            title: 'Title',
            version: '1.0',
          },
          components: {
            securitySchemes: {
              otherScheme,
            },
          },
          paths: {},
        },
      );

      assert.strictEqual(predicateCallCount, 2);
    });

    it('removes requirement on root for removed scheme', () => {
      const myScheme = { type: 'apiKey', name: 'test', in: 'query' };
      let predicateCallCount = 0;
      assert.deepStrictEqual(
        new RemoveSecuritySchemeIfTransformer((securityScheme) => {
          predicateCallCount += 1;
          return securityScheme === myScheme;
        }).transformOpenApi(deepFreeze({
          openapi: '3.0.3',
          info: {
            title: 'Title',
            version: '1.0',
          },
          components: {
            securitySchemes: {
              myScheme,
            },
          },
          security: [
            { myScheme: [] },
          ],
          paths: {},
        })),
        {
          openapi: '3.0.3',
          info: {
            title: 'Title',
            version: '1.0',
          },
          components: {},
          paths: {},
        },
      );

      assert.strictEqual(predicateCallCount, 1);
    });

    it('removes requirement on operation for removed scheme', () => {
      const myScheme = { type: 'apiKey', name: 'test', in: 'query' };
      let predicateCallCount = 0;
      assert.deepStrictEqual(
        new RemoveSecuritySchemeIfTransformer((securityScheme) => {
          predicateCallCount += 1;
          return securityScheme === myScheme;
        }).transformOpenApi(deepFreeze({
          openapi: '3.0.3',
          info: {
            title: 'Title',
            version: '1.0',
          },
          components: {
            securitySchemes: {
              myScheme,
            },
          },
          paths: {
            '/': {
              get: {
                operationId: 'getRoot',
                security: [
                  { myScheme: [] },
                ],
                responses: {
                  204: {
                    description: 'Example response',
                  },
                },
              },
            },
          },
        })),
        {
          openapi: '3.0.3',
          info: {
            title: 'Title',
            version: '1.0',
          },
          components: {},
          paths: {
            '/': {
              get: {
                operationId: 'getRoot',
                responses: {
                  204: {
                    description: 'Example response',
                  },
                },
              },
            },
          },
        },
      );

      assert.strictEqual(predicateCallCount, 1);
    });

    it('removes requirement on root for removed scheme not other', () => {
      const myScheme = { type: 'apiKey', name: 'test', in: 'query' };
      const otherScheme = { type: 'apiKey', name: 'test2', in: 'query' };
      let predicateCallCount = 0;
      assert.deepStrictEqual(
        new RemoveSecuritySchemeIfTransformer((securityScheme) => {
          predicateCallCount += 1;
          return securityScheme === myScheme;
        }).transformOpenApi(deepFreeze({
          openapi: '3.0.3',
          info: {
            title: 'Title',
            version: '1.0',
          },
          components: {
            securitySchemes: {
              myScheme,
              otherScheme,
            },
          },
          security: [
            { myScheme: [] },
            { otherScheme: [] },
          ],
          paths: {},
        })),
        {
          openapi: '3.0.3',
          info: {
            title: 'Title',
            version: '1.0',
          },
          components: {
            securitySchemes: {
              otherScheme,
            },
          },
          security: [
            { otherScheme: [] },
          ],
          paths: {},
        },
      );

      assert.strictEqual(predicateCallCount, 2);
    });

    it('removes requirement on root for removed scheme with other', () => {
      const myScheme = { type: 'apiKey', name: 'test', in: 'query' };
      const otherScheme = { type: 'apiKey', name: 'test2', in: 'query' };
      let predicateCallCount = 0;
      assert.deepStrictEqual(
        new RemoveSecuritySchemeIfTransformer((securityScheme) => {
          predicateCallCount += 1;
          return securityScheme === myScheme;
        }).transformOpenApi(deepFreeze({
          openapi: '3.0.3',
          info: {
            title: 'Title',
            version: '1.0',
          },
          components: {
            securitySchemes: {
              myScheme,
              otherScheme,
            },
          },
          security: [
            {
              myScheme: [],
              otherScheme: [],
            },
          ],
          paths: {},
        })),
        {
          openapi: '3.0.3',
          info: {
            title: 'Title',
            version: '1.0',
          },
          components: {
            securitySchemes: {
              otherScheme,
            },
          },
          security: [
            { otherScheme: [] },
          ],
          paths: {},
        },
      );

      assert.strictEqual(predicateCallCount, 2);
    });

    // OAS 3.1 is explicit that "To make security optional, an empty security
    // requirement ({}) can be included in the array."  Therefore, it must
    // not be removed.
    it('does not remove previously empty requirement', () => {
      const myScheme = { type: 'apiKey', name: 'test', in: 'query' };
      let predicateCallCount = 0;
      assert.deepStrictEqual(
        new RemoveSecuritySchemeIfTransformer((securityScheme) => {
          predicateCallCount += 1;
          return securityScheme === myScheme;
        }).transformOpenApi(deepFreeze({
          openapi: '3.0.3',
          info: {
            title: 'Title',
            version: '1.0',
          },
          components: {
            securitySchemes: {
              myScheme,
            },
          },
          security: [
            { myScheme: [] },
            {},
          ],
          paths: {},
        })),
        {
          openapi: '3.0.3',
          info: {
            title: 'Title',
            version: '1.0',
          },
          components: {},
          security: [
            {},
          ],
          paths: {},
        },
      );

      assert.strictEqual(predicateCallCount, 1);
    });
  });

  describe('with OpenAPI 2', () => {
    it('removes only scheme from securityDefinitions', () => {
      const myScheme = { type: 'apiKey', name: 'test', in: 'query' };
      let predicateCallCount = 0;
      assert.deepStrictEqual(
        new RemoveSecuritySchemeIfTransformer((securityScheme) => {
          predicateCallCount += 1;
          return securityScheme === myScheme;
        }).transformOpenApi(deepFreeze({
          swagger: '2.0',
          info: {
            title: 'Title',
            version: '1.0',
          },
          securityDefinitions: {
            myScheme,
          },
          paths: {},
        })),
        {
          swagger: '2.0',
          info: {
            title: 'Title',
            version: '1.0',
          },
          paths: {},
        },
      );

      assert.strictEqual(predicateCallCount, 1);
    });

    it('removes one scheme from securityDefinitions', () => {
      const myScheme = { type: 'apiKey', name: 'test', in: 'query' };
      const otherScheme = { type: 'apiKey', name: 'test2', in: 'query' };
      let predicateCallCount = 0;
      assert.deepStrictEqual(
        new RemoveSecuritySchemeIfTransformer((securityScheme) => {
          predicateCallCount += 1;
          return securityScheme === myScheme;
        }).transformOpenApi(deepFreeze({
          swagger: '2.0',
          info: {
            title: 'Title',
            version: '1.0',
          },
          securityDefinitions: {
            myScheme,
            otherScheme,
          },
          paths: {},
        })),
        {
          swagger: '2.0',
          info: {
            title: 'Title',
            version: '1.0',
          },
          securityDefinitions: {
            otherScheme,
          },
          paths: {},
        },
      );

      assert.strictEqual(predicateCallCount, 2);
    });

    it('removes requirement on root for removed scheme', () => {
      const myScheme = { type: 'apiKey', name: 'test', in: 'query' };
      let predicateCallCount = 0;
      assert.deepStrictEqual(
        new RemoveSecuritySchemeIfTransformer((securityScheme) => {
          predicateCallCount += 1;
          return securityScheme === myScheme;
        }).transformOpenApi(deepFreeze({
          swagger: '2.0',
          info: {
            title: 'Title',
            version: '1.0',
          },
          securityDefinitions: {
            myScheme,
          },
          security: [
            { myScheme: [] },
          ],
          paths: {},
        })),
        {
          swagger: '2.0',
          info: {
            title: 'Title',
            version: '1.0',
          },
          paths: {},
        },
      );

      assert.strictEqual(predicateCallCount, 1);
    });

    it('removes requirement on operation for removed scheme', () => {
      const myScheme = { type: 'apiKey', name: 'test', in: 'query' };
      let predicateCallCount = 0;
      assert.deepStrictEqual(
        new RemoveSecuritySchemeIfTransformer((securityScheme) => {
          predicateCallCount += 1;
          return securityScheme === myScheme;
        }).transformOpenApi(deepFreeze({
          swagger: '2.0',
          info: {
            title: 'Title',
            version: '1.0',
          },
          securityDefinitions: {
            myScheme,
          },
          paths: {
            '/': {
              get: {
                operationId: 'getRoot',
                security: [
                  { myScheme: [] },
                ],
                responses: {
                  204: {
                    description: 'Example response',
                  },
                },
              },
            },
          },
        })),
        {
          swagger: '2.0',
          info: {
            title: 'Title',
            version: '1.0',
          },
          paths: {
            '/': {
              get: {
                operationId: 'getRoot',
                responses: {
                  204: {
                    description: 'Example response',
                  },
                },
              },
            },
          },
        },
      );

      assert.strictEqual(predicateCallCount, 1);
    });

    it('removes requirement on root for removed scheme not other', () => {
      const myScheme = { type: 'apiKey', name: 'test', in: 'query' };
      const otherScheme = { type: 'apiKey', name: 'test2', in: 'query' };
      let predicateCallCount = 0;
      assert.deepStrictEqual(
        new RemoveSecuritySchemeIfTransformer((securityScheme) => {
          predicateCallCount += 1;
          return securityScheme === myScheme;
        }).transformOpenApi(deepFreeze({
          swagger: '2.0',
          info: {
            title: 'Title',
            version: '1.0',
          },
          securityDefinitions: {
            myScheme,
            otherScheme,
          },
          security: [
            { myScheme: [] },
            { otherScheme: [] },
          ],
          paths: {},
        })),
        {
          swagger: '2.0',
          info: {
            title: 'Title',
            version: '1.0',
          },
          securityDefinitions: {
            otherScheme,
          },
          security: [
            { otherScheme: [] },
          ],
          paths: {},
        },
      );

      assert.strictEqual(predicateCallCount, 2);
    });

    it('removes requirement on root for removed scheme with other', () => {
      const myScheme = { type: 'apiKey', name: 'test', in: 'query' };
      const otherScheme = { type: 'apiKey', name: 'test2', in: 'query' };
      let predicateCallCount = 0;
      assert.deepStrictEqual(
        new RemoveSecuritySchemeIfTransformer((securityScheme) => {
          predicateCallCount += 1;
          return securityScheme === myScheme;
        }).transformOpenApi(deepFreeze({
          swagger: '2.0',
          info: {
            title: 'Title',
            version: '1.0',
          },
          securityDefinitions: {
            myScheme,
            otherScheme,
          },
          security: [
            {
              myScheme: [],
              otherScheme: [],
            },
          ],
          paths: {},
        })),
        {
          swagger: '2.0',
          info: {
            title: 'Title',
            version: '1.0',
          },
          securityDefinitions: {
            otherScheme,
          },
          security: [
            { otherScheme: [] },
          ],
          paths: {},
        },
      );

      assert.strictEqual(predicateCallCount, 2);
    });

    it('does not remove previously empty requirement', () => {
      const myScheme = { type: 'apiKey', name: 'test', in: 'query' };
      let predicateCallCount = 0;
      assert.deepStrictEqual(
        new RemoveSecuritySchemeIfTransformer((securityScheme) => {
          predicateCallCount += 1;
          return securityScheme === myScheme;
        }).transformOpenApi(deepFreeze({
          swagger: '2.0',
          info: {
            title: 'Title',
            version: '1.0',
          },
          securityDefinitions: {
            myScheme,
          },
          security: [
            { myScheme: [] },
            {},
          ],
          paths: {},
        })),
        {
          swagger: '2.0',
          info: {
            title: 'Title',
            version: '1.0',
          },
          security: [
            {},
          ],
          paths: {},
        },
      );

      assert.strictEqual(predicateCallCount, 1);
    });
  });
});
