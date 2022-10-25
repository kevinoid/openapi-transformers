/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';
import deepFreeze from 'deep-freeze';

import ReplacedByToDescriptionTransformer
  from '../replaced-by-to-description.js';

describe('ReplacedByToDescriptionTransformer', () => {
  it('x-deprecated.replaced-by to description for openapi 3 schema', () => {
    assert.deepStrictEqual(
      new ReplacedByToDescriptionTransformer().transformOpenApi(deepFreeze({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              type: 'object',
              'x-deprecated': {
                'replaced-by': 'Example2',
              },
            },
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
          schemas: {
            Example: {
              type: 'object',
              'x-deprecated': {
                description: 'Use Example2 instead.',
                'replaced-by': 'Example2',
              },
            },
          },
        },
        paths: {},
      },
    );
  });

  it('does not change existing x-deprecated.description', () => {
    assert.deepStrictEqual(
      new ReplacedByToDescriptionTransformer().transformOpenApi(deepFreeze({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              type: 'object',
              'x-deprecated': {
                description: 'Use something else.  Anything.',
                'replaced-by': 'Example2',
              },
            },
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
          schemas: {
            Example: {
              type: 'object',
              'x-deprecated': {
                description: 'Use something else.  Anything.',
                'replaced-by': 'Example2',
              },
            },
          },
        },
        paths: {},
      },
    );
  });

  it('x-deprecated.replaced-by to description for openapi 3 property', () => {
    assert.deepStrictEqual(
      new ReplacedByToDescriptionTransformer().transformOpenApi(deepFreeze({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  'x-deprecated': {
                    'replaced-by': 'name2',
                  },
                },
              },
            },
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
          schemas: {
            Example: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  'x-deprecated': {
                    description: 'Use name2 instead.',
                    'replaced-by': 'name2',
                  },
                },
              },
            },
          },
        },
        paths: {},
      },
    );
  });
});
