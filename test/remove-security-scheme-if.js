/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';

import deepFreeze from 'deep-freeze';

import RemoveSecuritySchemeIfTransformer from '../remove-security-scheme-if.js';
import { get2, openapi, swagger } from '../test-lib/skeletons.js';

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
          ...openapi,
          components: {
            securitySchemes: { myScheme },
          },
          paths: {},
        })),
        {
          ...openapi,
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
          ...openapi,
          components: {
            securitySchemes: {
              myScheme,
              otherScheme,
            },
          },
          paths: {},
        })),
        {
          ...openapi,
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
          ...openapi,
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
          ...openapi,
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
          ...openapi,
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
          ...openapi,
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
          ...openapi,
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
          ...openapi,
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
          ...openapi,
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
          ...openapi,
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
          ...openapi,
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
          ...openapi,
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
          ...swagger,
          securityDefinitions: {
            myScheme,
          },
          paths: {},
        })),
        {
          ...swagger,
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
          ...swagger,
          securityDefinitions: {
            myScheme,
            otherScheme,
          },
          paths: {},
        })),
        {
          ...swagger,
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
          ...swagger,
          securityDefinitions: {
            myScheme,
          },
          security: [
            { myScheme: [] },
          ],
          paths: {},
        })),
        {
          ...swagger,
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
          ...swagger,
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
        get2({
          operationId: 'getRoot',
          responses: {
            204: {
              description: 'Example response',
            },
          },
        }),
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
          ...swagger,
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
          ...swagger,
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
          ...swagger,
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
          ...swagger,
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
          ...swagger,
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
          ...swagger,
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
