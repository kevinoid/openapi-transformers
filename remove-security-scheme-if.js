/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import OpenApiTransformerBase from 'openapi-transformer-base';

const emptyRequirement = {};
const predicateSymbol = Symbol('predicate');
const removedSchemesSymbol = Symbol('removedSchemes');

/**
 * Transformer to remove security schemes matching a given predicate.
 */
export default class RemoveSecuritySchemeIfTransformer
  extends OpenApiTransformerBase {
  /** Constructs a new RemoveSecuritySchemeIfTransformer with a given
   * predicate.
   *
   * @param {function(!object)} predicate Predicate which returns true if
   * the given Security Scheme should be removed and false otherwise.
   */
  constructor(predicate) {
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }

    super();

    this[predicateSymbol] = predicate;
    this[removedSchemesSymbol] = new Set();
  }

  transformSecuritySchemesEarly(securitySchemes) {
    const removedSchemes = this[removedSchemesSymbol];

    let isEmpty = true;
    const newSecuritySchemes = {};
    for (const [schemeName, securityScheme]
      of Object.entries(securitySchemes)) {
      if (securityScheme !== undefined) {
        if (this[predicateSymbol](securityScheme)) {
          removedSchemes.add(schemeName);
        } else {
          isEmpty = false;
          newSecuritySchemes[schemeName] = securityScheme;
        }
      }
    }

    return isEmpty ? undefined : newSecuritySchemes;
  }

  transformSecurityRequirement(securityRequirement) {
    if (typeof securityRequirement !== 'object'
      || securityRequirement === null) {
      this.warn(
        'Ignoring non-object Security Requirement',
        securityRequirement,
      );
      return securityRequirement;
    }

    if (Array.isArray(securityRequirement)) {
      this.warn(
        'Ignoring non-object Security Requirement',
        securityRequirement,
      );
      return securityRequirement;
    }

    const removedSchemes = this[removedSchemesSymbol];
    let isEmpty = true;
    let removedAny = false;
    const newSecurityRequirement = {};
    for (const [schemeName, securityScheme]
      of Object.entries(securityRequirement)) {
      if (securityScheme !== undefined) {
        if (removedSchemes.has(schemeName)) {
          removedAny = true;
        } else {
          isEmpty = false;
          newSecurityRequirement[schemeName] = securityScheme;
        }
      }
    }

    // Return empty marker only if it was made empty by removing scheme(s).
    // Leave already (effectively) empty Security Requirements as-is.
    return removedAny && isEmpty ? emptyRequirement : newSecurityRequirement;
  }

  transformOperation(operation) {
    const newOperation = super.transformOperation(operation);

    if (newOperation
      && Array.isArray(newOperation.security)
      && newOperation.security.length > 0) {
      // Remove any empty requirements which were created.
      newOperation.security =
        newOperation.security.filter((sr) => sr !== emptyRequirement);

      // Remove the whole array if there are no requirements remaining.
      if (newOperation.security.length === 0) {
        delete newOperation.security;
      }
    }

    return newOperation;
  }

  transformOpenApi(openApi) {
    let newSecuritySchemes;
    if (openApi
      && openApi.components
      && openApi.components.securitySchemes) {
      newSecuritySchemes =
        this.transformSecuritySchemesEarly(openApi.components.securitySchemes);
    }

    let newSecurityDefinitions;
    if (openApi && openApi.securityDefinitions) {
      newSecurityDefinitions =
        this.transformSecuritySchemesEarly(openApi.securityDefinitions);
    }

    if (this[removedSchemesSymbol].size === 0) {
      return openApi;
    }

    let newOpenApi = super.transformOpenApi(openApi);
    if (newOpenApi === openApi) {
      newOpenApi = { ...newOpenApi };
    }

    if (Array.isArray(newOpenApi.security)
      && newOpenApi.security.length > 0) {
      // Remove any empty requirements which were created.
      newOpenApi.security =
        newOpenApi.security.filter((sr) => sr !== emptyRequirement);

      // Remove the whole array if there are no requirements remaining.
      if (newOpenApi.security.length === 0) {
        delete newOpenApi.security;
      }
    }

    // Remove securitySchemes where appropriate
    if (newOpenApi.components) {
      if (newSecuritySchemes === undefined) {
        delete newOpenApi.components.securitySchemes;
      } else {
        newOpenApi.components.securitySchemes = newSecuritySchemes;
      }
    }

    // Remove securityDefinitions where appropriate
    if (newSecurityDefinitions === undefined) {
      delete newOpenApi.securityDefinitions;
    } else {
      newOpenApi.securityDefinitions = newSecurityDefinitions;
    }

    return newOpenApi;
  }
}
