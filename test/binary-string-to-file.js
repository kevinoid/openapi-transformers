/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';

import deepFreeze from 'deep-freeze';

import BinaryStringToFileTransformer from '../binary-string-to-file.js';
import { post2, schema3 } from '../test-lib/skeletons.js';

describe('BinaryStringToFileTransformer', () => {
  it('openapi 3 with format: binary in components', () => {
    assert.deepStrictEqual(
      new BinaryStringToFileTransformer().transformOpenApi(deepFreeze(schema3({
        type: 'string',
        format: 'binary',
      }))),
      schema3({
        type: 'file',
      }),
    );
  });

  it('openapi 3 with format: file in components', () => {
    assert.deepStrictEqual(
      new BinaryStringToFileTransformer().transformOpenApi(deepFreeze(schema3({
        type: 'string',
        format: 'file',
      }))),
      schema3({
        type: 'file',
      }),
    );
  });

  it('openapi 3 without format in components', () => {
    assert.deepStrictEqual(
      new BinaryStringToFileTransformer().transformOpenApi(deepFreeze(schema3({
        type: 'string',
      }))),
      schema3({
        type: 'string',
      }),
    );
  });

  it('swagger 2 format: binary in parameter schema', () => {
    assert.deepStrictEqual(
      new BinaryStringToFileTransformer().transformOpenApi(deepFreeze(post2({
        parameters: [
          {
            in: 'body',
            name: 'myfile',
            schema: {
              type: 'string',
              format: 'binary',
            },
          },
        ],
        responses: {
          204: {
            description: 'Example response',
          },
        },
      }))),
      post2({
        parameters: [
          {
            in: 'body',
            name: 'myfile',
            schema: {
              type: 'file',
            },
          },
        ],
        responses: {
          204: {
            description: 'Example response',
          },
        },
      }),
    );
  });

  it('swagger 2 format: file in parameter schema', () => {
    assert.deepStrictEqual(
      new BinaryStringToFileTransformer().transformOpenApi(deepFreeze(post2({
        parameters: [
          {
            in: 'body',
            name: 'myfile',
            schema: {
              type: 'string',
              format: 'file',
            },
          },
        ],
        responses: {
          204: {
            description: 'Example response',
          },
        },
      }))),
      post2({
        parameters: [
          {
            in: 'body',
            name: 'myfile',
            schema: {
              type: 'file',
            },
          },
        ],
        responses: {
          204: {
            description: 'Example response',
          },
        },
      }),
    );
  });

  it('swagger 2 format: binary in parameter', () => {
    assert.deepStrictEqual(
      new BinaryStringToFileTransformer().transformOpenApi(deepFreeze(post2({
        parameters: [
          {
            in: 'formData',
            name: 'myfile',
            type: 'string',
            format: 'binary',
          },
        ],
        responses: {
          204: {
            description: 'Example response',
          },
        },
      }))),
      post2({
        parameters: [
          {
            in: 'formData',
            name: 'myfile',
            type: 'file',
          },
        ],
        responses: {
          204: {
            description: 'Example response',
          },
        },
      }),
    );
  });

  it('swagger 2 format: file in parameter', () => {
    assert.deepStrictEqual(
      new BinaryStringToFileTransformer().transformOpenApi(deepFreeze(post2({
        parameters: [
          {
            in: 'formData',
            name: 'myfile',
            type: 'string',
            format: 'file',
          },
        ],
        responses: {
          204: {
            description: 'Example response',
          },
        },
      }))),
      post2({
        parameters: [
          {
            in: 'formData',
            name: 'myfile',
            type: 'file',
          },
        ],
        responses: {
          204: {
            description: 'Example response',
          },
        },
      }),
    );
  });
});
