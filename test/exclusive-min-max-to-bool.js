/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';
import deepFreeze from 'deep-freeze';

import ExclusiveMinMaxToBoolTransformer from '../exclusive-min-max-to-bool.js';

describe('ExclusiveMinMaxToBoolTransformer', () => {
  it('transforms exclusiveMaximum: 1 to bool', () => {
    assert.deepStrictEqual(
      new ExclusiveMinMaxToBoolTransformer().transformOpenApi(deepFreeze({
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              exclusiveMaximum: 1,
            },
          },
        },
        paths: {},
      })),
      {
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              exclusiveMaximum: true,
              maximum: 1,
            },
          },
        },
        paths: {},
      },
    );
  });

  it('transforms exclusiveMinimum: 1 to bool', () => {
    assert.deepStrictEqual(
      new ExclusiveMinMaxToBoolTransformer().transformOpenApi(deepFreeze({
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              exclusiveMinimum: 1,
            },
          },
        },
        paths: {},
      })),
      {
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              exclusiveMinimum: true,
              minimum: 1,
            },
          },
        },
        paths: {},
      },
    );
  });

  it('removes exclusiveMaximum > maximum', () => {
    assert.deepStrictEqual(
      new ExclusiveMinMaxToBoolTransformer().transformOpenApi(deepFreeze({
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              exclusiveMaximum: 1,
              maximum: 0,
            },
          },
        },
        paths: {},
      })),
      {
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              maximum: 0,
            },
          },
        },
        paths: {},
      },
    );
  });

  it('removes exclusiveMinimum < minimum', () => {
    assert.deepStrictEqual(
      new ExclusiveMinMaxToBoolTransformer().transformOpenApi(deepFreeze({
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              exclusiveMinimum: 0,
              minimum: 1,
            },
          },
        },
        paths: {},
      })),
      {
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              minimum: 1,
            },
          },
        },
        paths: {},
      },
    );
  });

  it('replaces exclusiveMaximum < maximum', () => {
    assert.deepStrictEqual(
      new ExclusiveMinMaxToBoolTransformer().transformOpenApi(deepFreeze({
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              exclusiveMaximum: 0,
              maximum: 1,
            },
          },
        },
        paths: {},
      })),
      {
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              exclusiveMaximum: true,
              maximum: 0,
            },
          },
        },
        paths: {},
      },
    );
  });

  it('replaces exclusiveMinimum > minimum', () => {
    assert.deepStrictEqual(
      new ExclusiveMinMaxToBoolTransformer().transformOpenApi(deepFreeze({
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              exclusiveMinimum: 1,
              minimum: 0,
            },
          },
        },
        paths: {},
      })),
      {
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              exclusiveMinimum: true,
              minimum: 1,
            },
          },
        },
        paths: {},
      },
    );
  });

  it('replaces exclusiveMaximum == maximum', () => {
    assert.deepStrictEqual(
      new ExclusiveMinMaxToBoolTransformer().transformOpenApi(deepFreeze({
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              exclusiveMaximum: 1,
              maximum: 1,
            },
          },
        },
        paths: {},
      })),
      {
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              exclusiveMaximum: true,
              maximum: 1,
            },
          },
        },
        paths: {},
      },
    );
  });

  it('replaces exclusiveMinimum == minimum', () => {
    assert.deepStrictEqual(
      new ExclusiveMinMaxToBoolTransformer().transformOpenApi(deepFreeze({
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              exclusiveMinimum: 1,
              minimum: 1,
            },
          },
        },
        paths: {},
      })),
      {
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              exclusiveMinimum: true,
              minimum: 1,
            },
          },
        },
        paths: {},
      },
    );
  });

  it('ignores non-numeric exclusiveMaximum', () => {
    assert.deepStrictEqual(
      new ExclusiveMinMaxToBoolTransformer().transformOpenApi(deepFreeze({
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              exclusiveMaximum: 'test',
            },
          },
        },
        paths: {},
      })),
      {
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              exclusiveMaximum: 'test',
            },
          },
        },
        paths: {},
      },
    );
  });

  it('ignores non-numeric exclusiveMinimum', () => {
    assert.deepStrictEqual(
      new ExclusiveMinMaxToBoolTransformer().transformOpenApi(deepFreeze({
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              exclusiveMinimum: 'test',
            },
          },
        },
        paths: {},
      })),
      {
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              exclusiveMinimum: 'test',
            },
          },
        },
        paths: {},
      },
    );
  });
});
