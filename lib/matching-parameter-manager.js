/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import MatchingComponentManager from './matching-component-manager.js';

/** Gets a copy of a parameter with x-ms-parameter-location removed if
 * its value is 'client'.
 *
 * Autorest treats defined parameters as properties on the client by default.
 * (i.e. the same as x-ms-parameter-location:client)  Therefore, remove
 * x-ms-parameter-location:client when comparing/keying parameters so
 * it doesn't affect equality.
 *
 * @param {object=} parameter Parameter Object to strip.
 * @returns {object=} Copy of parameter with x-ms-parameter-location removed if
 * its value is 'client'.  Otherwise, parameter.
 */
function stripClientXMsParamLoc(parameter) {
  if (parameter && parameter['x-ms-parameter-location'] === 'client') {
    const { 'x-ms-parameter-location': _, ...paramNoLoc } = parameter;
    return paramNoLoc;
  }

  return parameter;
}

/** Adds values to defined components by first attempting to match an
 * existing value in the component.
 */
export default class MatchingParameterManager extends MatchingComponentManager {
  getKey(parameter) {
    return super.getKey(stripClientXMsParamLoc(parameter));
  }
}
