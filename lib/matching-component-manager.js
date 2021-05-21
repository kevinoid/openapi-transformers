/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

// Any unique, deterministic stringify function would work.
// TODO: Benchmark against native JSON.stringify result of sort-keys deep
// https://github.com/sindresorhus/getKey-obj/blob/master/index.js#L17
// https://github.com/epoberezkin/fast-json-stable-stringify#benchmark
import stringify from 'fast-json-stable-stringify';

import ComponentManager from './component-manager.js';

const keyToNameSymbol = Symbol('keyToName');

/** Adds values to defined components by first attempting to match an
 * existing value in the component.
 */
export default class MatchingComponentManager extends ComponentManager {
  constructor(component) {
    super(component);

    const keyToName = new Map();
    for (const [name, value] of Object.entries(component)) {
      keyToName.set(this.getKey(value), name);
    }
    this[keyToNameSymbol] = keyToName;
  }

  /** Adds a given value, optionally with a given (base) name.
   *
   * @param {*} value Value to add to the component being managed.
   * @param {string=} basename Preferred name for value in component.
   * ({@see getNames}).
   * @returns {string} Name of added value.
   */
  add(value, basename) {
    const key = this.getKey(value);
    const name = this[keyToNameSymbol].get(key);
    if (name) {
      return name;
    }

    const newName = super.add(value, basename);
    this[keyToNameSymbol].set(key, newName);
    return newName;
  }

  /** Determines if given values match such that an existing value can be used
   * in place of an added value.
   *
   * Overridden to always return false, since values which do not have equal
   * keys do not match (according to this class) and keys are checked before
   * calling super.add().
   *
   * FIXME: This optimization is useful to avoid wasting lots of cycles
   * for properties with many name conflicts with deep values, but it is
   * also a foot-gun if isMatch is called unexpectedly.  Find a better fix.
   *
   * @returns {boolean} False.
   */
  // eslint-disable-next-line class-methods-use-this
  isMatch() {
    return false;
  }
}

/** Converts a value to an key which uniquely identifies the value for
 * matching.
 *
 * @param {*} value Value to identify.
 * @returns {*} Key which uniquely matches the value.
 */
MatchingComponentManager.prototype.getKey = stringify;
