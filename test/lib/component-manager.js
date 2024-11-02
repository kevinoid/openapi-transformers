/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';

import ComponentManager from '../../lib/component-manager.js';

describe('ComponentManager', () => {
  describe('constructor', () => {
    it('throws TypeError without args', () => {
      assert.throws(
        () => new ComponentManager(),
        TypeError,
      );
    });

    it('throws TypeError for null', () => {
      assert.throws(
        () => new ComponentManager(null),
        TypeError,
      );
    });

    it('throws TypeError for Array', () => {
      assert.throws(
        () => new ComponentManager([]),
        TypeError,
      );
    });
  });

  describe('#add()', () => {
    it('sets component[name] to value when no conflict', () => {
      const name = 'test';
      const value = {};
      const component = {};
      const newName = new ComponentManager(component).add(value, name);
      assert.strictEqual(newName, name);
      assert.strictEqual(component[name], value);
    });

    it('sets component[name+2] to value when name exists', () => {
      const name = 'test';
      const value = {};
      const component = { [name]: false };
      const newName = new ComponentManager(component).add(value, name);
      assert.strictEqual(newName, `${name}2`);
      assert.strictEqual(component[newName], value);
      assert.strictEqual(component[name], false);
    });

    it('overwrites component[name] when name is undefined', () => {
      const name = 'test';
      const value = {};
      const component = { [name]: undefined };
      const newName = new ComponentManager(component).add(value, name);
      assert.strictEqual(newName, name);
      assert.strictEqual(component[name], value);
    });

    it('returns name without overwrite when equal', () => {
      const name = 'test';
      const value = {};
      const origValue = {};
      const component = { [name]: origValue };
      const newName = new ComponentManager(component).add(value, name);
      assert.strictEqual(newName, name);
      assert.strictEqual(component[name], origValue);
      assert(!Object.hasOwn(component, `${name}2`));
    });

    // Note: This is done by MatchingComponentManager
    it('does not return name of equal value with different name', () => {
      const name = 'test';
      const value = {};
      const component = { other: value };
      const newName = new ComponentManager(component).add(value, name);
      assert.strictEqual(newName, name);
      assert.strictEqual(component[name], value);
    });

    it('sets component.undefined to value when no conflict', () => {
      const value = {};
      const component = {};
      const newName = new ComponentManager(component).add(value);
      assert.strictEqual(newName, 'undefined');
      assert.strictEqual(component.undefined, value);
    });

    it('sets component[name+2] to value when name exists', () => {
      const value = {};
      const component = { undefined: false };
      const newName = new ComponentManager(component).add(value);
      assert.strictEqual(newName, 'undefined2');
      assert.strictEqual(component.undefined2, value);
      assert.strictEqual(component.undefined, false);
    });
  });

  describe('#getNames()', () => {
    it('can be overridden to get names for #add()', () => {
      const name = 'test';
      const name2 = 'surprise';
      const value = {};
      const component = {};
      const manager = new ComponentManager(component);
      manager.getNames = function* (basename) {
        assert.strictEqual(this, manager);
        assert.strictEqual(basename, name);
        yield name2;
      };
      const newName = manager.add(value, name);
      assert.strictEqual(newName, name2);
      assert.strictEqual(component[name2], value);
    });

    it('causes #add() to throw if names are exhausted', () => {
      const manager = new ComponentManager({});
      // eslint-disable-next-line no-empty-function
      manager.getNames = function* (basename) {};
      assert.throws(
        () => manager.add({}, 'name'),
        /suitable name/i,
      );
    });
  });

  describe('#isMatch()', () => {
    it('can be overridden for #add() matching', () => {
      const name = 'test';
      const value = 'new';
      const component = { [name]: 'orig' };
      const manager = new ComponentManager(component);
      manager.isMatch = function(value1, value2) {
        assert.strictEqual(this, manager);
        assert.strictEqual(value1, 'orig');
        assert.strictEqual(value2, 'new');
        return true;
      };
      const newName = manager.add(value, name);
      assert.strictEqual(newName, name);
      assert.strictEqual(component[name], 'orig');
      assert(!Object.hasOwn(component, `${name}2`));
    });
  });
});
