/**
 * @copyright Copyright 2024 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';

import deepFreeze from 'deep-freeze';

import RemoveRefSiblingsTransformer from '../remove-ref-siblings.js';
import { schema3 } from '../test-lib/skeletons.js';

describe('RemoveRefSiblingsTransformer', () => {
  it('throws TypeError with null options', () => {
    assert.throws(
      () => new RemoveRefSiblingsTransformer(null),
      TypeError,
    );
  });

  it('throws TypeError with number options.remove', () => {
    assert.throws(
      () => new RemoveRefSiblingsTransformer({ remove: 1 }),
      TypeError,
    );
  });

  it('throws TypeError with number options.retain', () => {
    assert.throws(
      () => new RemoveRefSiblingsTransformer({ retain: 1 }),
      TypeError,
    );
  });

  it('throws Error with options.remove and options.retain', () => {
    assert.throws(
      () => new RemoveRefSiblingsTransformer({
        remove: [],
        retain: [],
      }),
      Error,
    );
  });

  it('removes all $ref siblings by default', () => {
    const transformer = new RemoveRefSiblingsTransformer();
    assert.deepStrictEqual(
      transformer.transformOpenApi(deepFreeze(schema3({
        title: 'Test',
        description: 'Test',
        $ref: '#/components/schemas/Test',
        required: ['name'],
      }))),
      schema3({
        $ref: '#/components/schemas/Test',
      }),
    );
  });

  it('does not remove non-$ref properties', () => {
    const transformer = new RemoveRefSiblingsTransformer();
    assert.deepStrictEqual(
      transformer.transformOpenApi(deepFreeze(schema3({
        type: 'number',
      }))),
      schema3({
        type: 'number',
      }),
    );
  });

  it('does not throw for null schema', () => {
    const transformer = new RemoveRefSiblingsTransformer();
    assert.deepStrictEqual(
      transformer.transformOpenApi(deepFreeze(schema3(null))),
      schema3(null),
    );
  });

  it('removes only siblings in options.remove Array', () => {
    const transformer = new RemoveRefSiblingsTransformer({
      remove: ['required'],
    });
    assert.deepStrictEqual(
      transformer.transformOpenApi(deepFreeze(schema3({
        title: 'Test',
        description: 'Test',
        $ref: '#/components/schemas/Test',
        required: ['name'],
      }))),
      schema3({
        title: 'Test',
        description: 'Test',
        $ref: '#/components/schemas/Test',
      }),
    );
  });

  it('removes siblings not in options.retain Array', () => {
    const transformer = new RemoveRefSiblingsTransformer({
      retain: ['required'],
    });
    assert.deepStrictEqual(
      transformer.transformOpenApi(deepFreeze(schema3({
        title: 'Test',
        description: 'Test',
        $ref: '#/components/schemas/Test',
        required: ['name'],
      }))),
      schema3({
        $ref: '#/components/schemas/Test',
        required: ['name'],
      }),
    );
  });

  it('removes only siblings where options.remove()', () => {
    const transformer = new RemoveRefSiblingsTransformer({
      remove: (propName) => propName === 'required',
    });
    assert.deepStrictEqual(
      transformer.transformOpenApi(deepFreeze(schema3({
        title: 'Test',
        description: 'Test',
        $ref: '#/components/schemas/Test',
        required: ['name'],
      }))),
      schema3({
        title: 'Test',
        description: 'Test',
        $ref: '#/components/schemas/Test',
      }),
    );
  });

  it('removes siblings not where options.retain()', () => {
    const transformer = new RemoveRefSiblingsTransformer({
      retain: (propName) => propName === 'required',
    });
    assert.deepStrictEqual(
      transformer.transformOpenApi(deepFreeze(schema3({
        title: 'Test',
        description: 'Test',
        $ref: '#/components/schemas/Test',
        required: ['name'],
      }))),
      schema3({
        $ref: '#/components/schemas/Test',
        required: ['name'],
      }),
    );
  });

  it('does not pass "$ref" to options.remove', () => {
    const transformer = new RemoveRefSiblingsTransformer({
      remove: (propName) => {
        assert.notStrictEqual(propName, '$ref');
        return false;
      },
    });
    transformer.transformOpenApi(deepFreeze(schema3({
      title: 'Test',
      description: 'Test',
      $ref: '#/components/schemas/Test',
      required: ['name'],
    })));
  });

  it('does not pass "$ref" to options.retain', () => {
    const transformer = new RemoveRefSiblingsTransformer({
      retain: (propName) => {
        assert.notStrictEqual(propName, '$ref');
        return false;
      },
    });
    transformer.transformOpenApi(deepFreeze(schema3({
      title: 'Test',
      description: 'Test',
      $ref: '#/components/schemas/Test',
      required: ['name'],
    })));
  });

  it('preserves property order', () => {
    // eslint-disable-next-line unicorn/consistent-function-scoping
    function retain(propName) {
      return propName !== 'required';
    }
    const transformer = new RemoveRefSiblingsTransformer({ retain });
    const origSchema = {
      title: 'Test',
      description: 'Test',
      $ref: '#/components/schemas/Test',
      required: ['name'],
    };
    const openapi =
      transformer.transformOpenApi(deepFreeze(schema3(origSchema)));
    const newSchema = openapi.components.schemas.Test;
    assert.deepStrictEqual(
      Object.keys(origSchema).filter(retain),
      Object.keys(newSchema),
    );
  });
});
