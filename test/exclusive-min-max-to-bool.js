/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';

import deepFreeze from 'deep-freeze';

import ExclusiveMinMaxToBoolTransformer from '../exclusive-min-max-to-bool.js';
import { schema3 } from '../test-lib/skeletons.js';

describe('ExclusiveMinMaxToBoolTransformer', () => {
  it('transforms exclusiveMaximum: 1 to bool', () => {
    assert.deepStrictEqual(
      new ExclusiveMinMaxToBoolTransformer().transformOpenApi(deepFreeze(
        schema3(
          { exclusiveMaximum: 1 },
          '3.1.0',
        ),
      )),
      schema3(
        {
          exclusiveMaximum: true,
          maximum: 1,
        },
        '3.1.0',
      ),
    );
  });

  it('transforms exclusiveMinimum: 1 to bool', () => {
    assert.deepStrictEqual(
      new ExclusiveMinMaxToBoolTransformer().transformOpenApi(deepFreeze(
        schema3(
          { exclusiveMinimum: 1 },
          '3.1.0',
        ),
      )),
      schema3(
        {
          exclusiveMinimum: true,
          minimum: 1,
        },
        '3.1.0',
      ),
    );
  });

  it('removes exclusiveMaximum > maximum', () => {
    assert.deepStrictEqual(
      new ExclusiveMinMaxToBoolTransformer().transformOpenApi(deepFreeze(
        schema3(
          {
            exclusiveMaximum: 1,
            maximum: 0,
          },
          '3.1.0',
        ),
      )),
      schema3(
        { maximum: 0 },
        '3.1.0',
      ),
    );
  });

  it('removes exclusiveMinimum < minimum', () => {
    assert.deepStrictEqual(
      new ExclusiveMinMaxToBoolTransformer().transformOpenApi(deepFreeze(
        schema3(
          {
            exclusiveMinimum: 0,
            minimum: 1,
          },
          '3.1.0',
        ),
      )),
      schema3(
        { minimum: 1 },
        '3.1.0',
      ),
    );
  });

  it('replaces exclusiveMaximum < maximum', () => {
    assert.deepStrictEqual(
      new ExclusiveMinMaxToBoolTransformer().transformOpenApi(deepFreeze(
        schema3(
          {
            exclusiveMaximum: 0,
            maximum: 1,
          },
          '3.1.0',
        ),
      )),
      schema3(
        {
          exclusiveMaximum: true,
          maximum: 0,
        },
        '3.1.0',
      ),
    );
  });

  it('replaces exclusiveMinimum > minimum', () => {
    assert.deepStrictEqual(
      new ExclusiveMinMaxToBoolTransformer().transformOpenApi(deepFreeze(
        schema3(
          {
            exclusiveMinimum: 1,
            minimum: 0,
          },
          '3.1.0',
        ),
      )),
      schema3(
        {
          exclusiveMinimum: true,
          minimum: 1,
        },
        '3.1.0',
      ),
    );
  });

  it('replaces exclusiveMaximum == maximum', () => {
    assert.deepStrictEqual(
      new ExclusiveMinMaxToBoolTransformer().transformOpenApi(deepFreeze(
        schema3(
          {
            exclusiveMaximum: 1,
            maximum: 1,
          },
          '3.1.0',
        ),
      )),
      schema3(
        {
          exclusiveMaximum: true,
          maximum: 1,
        },
        '3.1.0',
      ),
    );
  });

  it('replaces exclusiveMinimum == minimum', () => {
    assert.deepStrictEqual(
      new ExclusiveMinMaxToBoolTransformer().transformOpenApi(deepFreeze(
        schema3(
          {
            exclusiveMinimum: 1,
            minimum: 1,
          },
          '3.1.0',
        ),
      )),
      schema3(
        {
          exclusiveMinimum: true,
          minimum: 1,
        },
        '3.1.0',
      ),
    );
  });

  it('ignores non-numeric exclusiveMaximum', () => {
    assert.deepStrictEqual(
      new ExclusiveMinMaxToBoolTransformer().transformOpenApi(deepFreeze(
        schema3(
          { exclusiveMaximum: 'test' },
          '3.1.0',
        ),
      )),
      schema3(
        { exclusiveMaximum: 'test' },
        '3.1.0',
      ),
    );
  });

  it('ignores non-numeric exclusiveMinimum', () => {
    assert.deepStrictEqual(
      new ExclusiveMinMaxToBoolTransformer().transformOpenApi(deepFreeze(
        schema3(
          { exclusiveMinimum: 'test' },
          '3.1.0',
        ),
      )),
      schema3({
        exclusiveMinimum: 'test',
      }, '3.1.0'),
    );
  });
});
