/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'assert';
import deepFreeze from 'deep-freeze';

import MergeSubschemasTransformer from '../merge-subschemas.js';

describe('MergeSubschemasTransformer', () => {
  describe('allOf', () => {
    // draft-bhutton-json-schema-00 specifies allOf MUST be non-empty.
    // If removal is desired, use a transformer for this specific purpose.
    it('does not modify empty Array', () => {
      assert.deepStrictEqual(
        new MergeSubschemasTransformer().transformOpenApi(deepFreeze({
          openapi: '3.0.3',
          info: {
            title: 'Title',
            version: '1.0',
          },
          components: {
            schemas: {
              Example: {
                allOf: [],
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
                allOf: [],
              },
            },
          },
          paths: {},
        },
      );
    });

    it('intersects single element with parent', () => {
      assert.deepStrictEqual(
        new MergeSubschemasTransformer().transformOpenApi(deepFreeze({
          openapi: '3.0.3',
          info: {
            title: 'Title',
            version: '1.0',
          },
          components: {
            schemas: {
              Example: {
                maximum: 5,
                allOf: [
                  { minimum: 3 },
                ],
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
                maximum: 5,
                minimum: 3,
              },
            },
          },
          paths: {},
        },
      );
    });
  });

  describe('anyOf', () => {
    // draft-bhutton-json-schema-00 specifies anyOf MUST be non-empty.
    // If removal is desired, use a transformer for this specific purpose.
    it('does not modify empty Array', () => {
      assert.deepStrictEqual(
        new MergeSubschemasTransformer().transformOpenApi(deepFreeze({
          openapi: '3.0.3',
          info: {
            title: 'Title',
            version: '1.0',
          },
          components: {
            schemas: {
              Example: {
                anyOf: [],
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
                anyOf: [],
              },
            },
          },
          paths: {},
        },
      );
    });

    it('intersects single element with parent', () => {
      assert.deepStrictEqual(
        new MergeSubschemasTransformer().transformOpenApi(deepFreeze({
          openapi: '3.0.3',
          info: {
            title: 'Title',
            version: '1.0',
          },
          components: {
            schemas: {
              Example: {
                maximum: 5,
                anyOf: [
                  { minimum: 3 },
                ],
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
                maximum: 5,
                minimum: 3,
              },
            },
          },
          paths: {},
        },
      );
    });
  });

  describe('oneOf', () => {
    // draft-bhutton-json-schema-00 specifies oneOf MUST be non-empty.
    // If removal is desired, use a transformer for this specific purpose.
    it('does not modify empty Array', () => {
      assert.deepStrictEqual(
        new MergeSubschemasTransformer().transformOpenApi(deepFreeze({
          openapi: '3.0.3',
          info: {
            title: 'Title',
            version: '1.0',
          },
          components: {
            schemas: {
              Example: {
                oneOf: [],
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
                oneOf: [],
              },
            },
          },
          paths: {},
        },
      );
    });

    it('intersects single element with parent', () => {
      assert.deepStrictEqual(
        new MergeSubschemasTransformer().transformOpenApi(deepFreeze({
          openapi: '3.0.3',
          info: {
            title: 'Title',
            version: '1.0',
          },
          components: {
            schemas: {
              Example: {
                maximum: 5,
                oneOf: [
                  { minimum: 3 },
                ],
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
                maximum: 5,
                minimum: 3,
              },
            },
          },
          paths: {},
        },
      );
    });
  });
});
