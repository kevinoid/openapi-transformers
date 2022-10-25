/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';

import MatchingParameterMatcher from '../../lib/matching-parameter-manager.js';

describe('MatchingParameterMatcher', () => {
  describe('constructor', () => {
    it('throws TypeError without args', () => {
      assert.throws(
        () => new MatchingParameterMatcher(),
        TypeError,
      );
    });

    it('throws TypeError for null', () => {
      assert.throws(
        () => new MatchingParameterMatcher(null),
        TypeError,
      );
    });

    it('throws TypeError for Array', () => {
      assert.throws(
        () => new MatchingParameterMatcher([]),
        TypeError,
      );
    });
  });

  describe('#add()', () => {
    it('sets parameters[name] to value when no conflict', () => {
      const name = 'test';
      const value = {};
      const parameters = {};
      const newName = new MatchingParameterMatcher(parameters).add(value, name);
      assert.strictEqual(newName, name);
      assert.strictEqual(parameters[name], value);
    });

    it('returns name without overwrite when equal', () => {
      const name = 'test';
      const value = {};
      const origValue = {};
      const parameters = { [name]: origValue };
      const newName = new MatchingParameterMatcher(parameters).add(value, name);
      assert.strictEqual(newName, name);
      assert.strictEqual(parameters[name], origValue);
      assert(!hasOwnProperty.call(parameters, `${name}2`));
    });

    it('returns unrelated name with equal value', () => {
      const name = 'test';
      const value = {};
      const origName = 'unrelated';
      const origValue = {};
      const parameters = { [origName]: origValue };
      const newName = new MatchingParameterMatcher(parameters)
        .add(value, name);
      assert.strictEqual(newName, origName);
      assert.strictEqual(parameters[newName], origValue);
      assert(!hasOwnProperty.call(parameters, name));
    });

    it('returns unrelated name with x-ms-parameter-location:client', () => {
      const name = 'test';
      const value = {
        in: 'query',
      };
      const origName = 'unrelated';
      const origValue = {
        in: 'query',
        'x-ms-parameter-location': 'client',
      };
      const parameters = { [origName]: origValue };
      const newName = new MatchingParameterMatcher(parameters)
        .add(value, name);
      assert.strictEqual(newName, origName);
      assert.strictEqual(parameters[newName], origValue);
      assert(!hasOwnProperty.call(parameters, name));
    });

    it('returns unrelated name without x-ms-parameter-location:client', () => {
      const name = 'test';
      const value = {
        in: 'query',
        'x-ms-parameter-location': 'client',
      };
      const origName = 'unrelated';
      const origValue = {
        in: 'query',
      };
      const parameters = { [origName]: origValue };
      const newName = new MatchingParameterMatcher(parameters)
        .add(value, name);
      assert.strictEqual(newName, origName);
      assert.strictEqual(parameters[newName], origValue);
      assert(!hasOwnProperty.call(parameters, name));
    });

    it('does not return name with x-ms-parameter-location:method', () => {
      const name = 'test';
      const value = {
        in: 'query',
      };
      const origName = 'unrelated';
      const origValue = {
        in: 'query',
        'x-ms-parameter-location': 'method',
      };
      const parameters = { [origName]: origValue };
      const newName = new MatchingParameterMatcher(parameters)
        .add(value, name);
      assert.strictEqual(newName, name);
      assert.strictEqual(parameters[newName], value);
      assert.strictEqual(parameters[origName], origValue);
    });

    it('does not return name without x-ms-parameter-location:method', () => {
      const name = 'test';
      const value = {
        in: 'query',
        'x-ms-parameter-location': 'method',
      };
      const origName = 'unrelated';
      const origValue = {
        in: 'query',
      };
      const parameters = { [origName]: origValue };
      const newName = new MatchingParameterMatcher(parameters)
        .add(value, name);
      assert.strictEqual(newName, name);
      assert.strictEqual(parameters[newName], value);
      assert.strictEqual(parameters[origName], origValue);
    });
  });
});
