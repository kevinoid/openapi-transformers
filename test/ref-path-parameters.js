/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'assert';

import RefPathParametersTransformer from '../ref-path-parameters.js';

describe('RefPathParametersTransformer', () => {
  it('openapi 3 path item parameters to components', () => {
    assert.deepStrictEqual(
      new RefPathParametersTransformer().transformOpenApi({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
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
      }),
      {
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
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
      new RefPathParametersTransformer().transformOpenApi({
        swagger: '2.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
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
      }),
      {
        swagger: '2.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
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
