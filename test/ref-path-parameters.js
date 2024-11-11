/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';

import deepFreeze from 'deep-freeze';

import RefPathParametersTransformer from '../ref-path-parameters.js';
import { openapi, swagger } from '../test-lib/skeletons.js';

describe('RefPathParametersTransformer', () => {
  it('openapi 3 path item parameters to components', () => {
    assert.deepStrictEqual(
      new RefPathParametersTransformer().transformOpenApi(deepFreeze({
        ...openapi,
        paths: {
          '/': {
            parameters: [
              {
                in: 'query',
                name: 'myquery',
                schema: {
                  type: 'string',
                },
              },
            ],
            get: {
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
        components: {
          parameters: {
            myquery: {
              in: 'query',
              name: 'myquery',
              schema: {
                type: 'string',
              },
            },
          },
        },
        paths: {
          '/': {
            parameters: [
              { $ref: '#/components/parameters/myquery' },
            ],
            get: {
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
  });

  it('swagger 2 path item parameters to components', () => {
    assert.deepStrictEqual(
      new RefPathParametersTransformer().transformOpenApi(deepFreeze({
        ...swagger,
        paths: {
          '/': {
            parameters: [
              {
                in: 'query',
                name: 'myquery',
                type: 'string',
              },
            ],
            get: {
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
        ...swagger,
        parameters: {
          myquery: {
            in: 'query',
            name: 'myquery',
            type: 'string',
          },
        },
        paths: {
          '/': {
            parameters: [
              { $ref: '#/parameters/myquery' },
            ],
            get: {
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
  });
});
