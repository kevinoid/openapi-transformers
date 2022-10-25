/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import { isDeepStrictEqual } from 'node:util';

/** Manages named additions to defined components.
 */
export default class ComponentManager {
  constructor(component) {
    if (component === null
      || typeof component !== 'object'
      || Array.isArray(component)) {
      throw new TypeError('component must be a non-Array, non-null object');
    }

    this.component = component;
  }

  /** Adds a given value, optionally with a given (base) name.
   *
   * @param {*} value Value to add to the component being managed.
   * @param {string=} basename Preferred name for value in component.
   * ({@see getNames}).
   * @returns {string} Name of added value.
   */
  add(value, basename) {
    for (const name of this.getNames(basename)) {
      if (this.component[name] === undefined) {
        this.component[name] = value;
        return name;
      }

      if (this.isMatch(this.component[name], value)) {
        return name;
      }
    }

    throw new Error('No suitable name matched value to add');
  }

  /** Gets property names to check for a given base name.
   *
   * @param {string=} basename Base name to use for property.
   * @yields {string} Property names to check for #add().
   */
  // eslint-disable-next-line class-methods-use-this
  * getNames(basename) {
    yield `${basename}`;
    for (let i = 2; ; i += 1) {
      yield `${basename}${i}`;
    }
  }
}

/** Determines if given values match such that an existing value can be used in
 * place of an added value.
 */
ComponentManager.prototype.isMatch = isDeepStrictEqual;
