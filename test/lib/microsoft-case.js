/**
 * @copyright Copyright 2024 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import { strict as assert } from 'node:assert';

import microsoftCase from '../../lib/microsoft-case.js';

describe('microsoftCase', () => {
  it('returns empty string unchanged', () => {
    assert.equal(microsoftCase(''), '');
  });

  it('converts undefined to "Undefined"', () => {
    assert.equal(microsoftCase(), 'Undefined');
  });

  it('converts 1 to "1"', () => {
    assert.equal(microsoftCase(1), '1');
  });

  it('converts "foo" to "foo"', () => {
    assert.equal(microsoftCase('foo'), 'Foo');
  });

  it('converts "Foo" to "foo"', () => {
    assert.equal(microsoftCase('Foo'), 'Foo');
  });

  it('converts "fOo" to "foo"', () => {
    assert.equal(microsoftCase('fOo'), 'FOo');
  });

  it('converts "FOO" to "foo"', () => {
    assert.equal(microsoftCase('FOO'), 'Foo');
  });

  it('converts "foo bar" to "FooBar"', () => {
    assert.equal(microsoftCase('foo bar'), 'FooBar');
  });
});
