/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

/* eslint-disable max-classes-per-file */

import assert from 'node:assert';

import MatchingComponentManager from '../../lib/matching-component-manager.js';

describe('MatchingComponentManager', () => {
  describe('constructor', () => {
    it('throws TypeError without args', () => {
      assert.throws(
        () => new MatchingComponentManager(),
        TypeError,
      );
    });

    it('throws TypeError for null', () => {
      assert.throws(
        () => new MatchingComponentManager(null),
        TypeError,
      );
    });

    it('throws TypeError for Array', () => {
      assert.throws(
        () => new MatchingComponentManager([]),
        TypeError,
      );
    });
  });

  describe('#add()', () => {
    it('sets component[name] to value when no conflict', () => {
      const name = 'test';
      const value = {};
      const component = {};
      const newName = new MatchingComponentManager(component).add(value, name);
      assert.strictEqual(newName, name);
      assert.strictEqual(component[name], value);
    });

    it('returns name without overwrite when equal', () => {
      const name = 'test';
      const value = {};
      const origValue = {};
      const component = { [name]: origValue };
      const newName = new MatchingComponentManager(component).add(value, name);
      assert.strictEqual(newName, name);
      assert.strictEqual(component[name], origValue);
      assert(!hasOwnProperty.call(component, `${name}2`));
    });

    it('returns unrelated name with equal value', () => {
      const name = 'test';
      const value = {};
      const origName = 'unrelated';
      const origValue = {};
      const component = { [origName]: origValue };
      const newName = new MatchingComponentManager(component)
        .add(value, name);
      assert.strictEqual(newName, origName);
      assert.strictEqual(component[newName], origValue);
      assert(!hasOwnProperty.call(component, name));
    });
  });

  describe('#getKey()', () => {
    it('can be overridden to find match for #add()', () => {
      const name = 'test';
      const value = [];
      const origName = 'unrelated';
      const origValue = {};
      const component = { [origName]: origValue };
      class TestManager extends MatchingComponentManager {
        getKey(keyVal) {
          assert(this instanceof TestManager);
          // Called with origValue by constructor, value by #add().
          assert(keyVal === origValue || keyVal === value);
          return 'mykey';
        }
      }
      const newName = new TestManager(component).add(value, name);
      assert.strictEqual(newName, origName);
      assert.strictEqual(component[newName], origValue);
      assert(!hasOwnProperty.call(component, name));
    });

    it('does not match key with unequal type', () => {
      const name = 'test';
      const value = [];
      const origName = 'unrelated';
      const origValue = {};
      const component = { [origName]: origValue };
      class TestManager extends MatchingComponentManager {
        // eslint-disable-next-line class-methods-use-this
        getKey(keyVal) {
          return keyVal === origValue ? 'true'
            : keyVal === value ? true
              : assert.fail('unexpected keyVal');
        }
      }
      const newName = new TestManager(component).add(value, name);
      assert.strictEqual(newName, name);
      assert.strictEqual(component[newName], value);
      assert.strictEqual(component[origName], origValue);
    });
  });
});
