/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 * @module "openapi-transformers/remove-request-body.js"
 */

import OpenApiTransformerBase from 'openapi-transformer-base';
import visit from 'openapi-transformer-base/visit.js';

const defaultMethodSet = new Set([
  // https://datatracker.ietf.org/doc/html/rfc7231#section-4.3.5
  // "A payload within a DELETE request message has no defined semantics"
  // However, I suspect it may not be uncommon for API developers to do so.
  // 'DELETE',

  // https://datatracker.ietf.org/doc/html/rfc7231#section-4.3.1
  // "A payload within a GET request message has no defined semantics"
  'get',

  // https://datatracker.ietf.org/doc/html/rfc7231#section-4.3.2
  // "A payload within a HEAD request message has no defined semantics"
  'head',

  // https://datatracker.ietf.org/doc/html/rfc7231#section-4.3.8
  // "A client MUST NOT send a message body in a TRACE request."
  'trace',
]);
const httpMethodSetSymbol = Symbol('httpMethodSet');

/**
 * Remove requestBody from operations on a given set of HTTP methods.
 *
 * This often occurs due to authoring errors where an operation which expects
 * a request body is copied to one that does not.
 */
export default class RemoveRequestBodyTransformer
  extends OpenApiTransformerBase {
  /** Constructs a RemoveRequestBodyTransformer for a given set of HTTP methods.
   *
   * @param {!module:globals.Iterable=} methods HTTP Methods for which to
   * remove requestBody.  (default: [GET, HEAD, TRACE])
   */
  constructor(methods) {
    super();
    this[httpMethodSetSymbol] =
      methods === undefined ? defaultMethodSet : new Set(
        [...methods].map((method) => method.toLowerCase()),
      );
  }

  transformPathItem(pathItem) {
    if (typeof pathItem !== 'object'
      || pathItem === null
      || Array.isArray(pathItem)) {
      this.warn('Ignoring non-object Path Item', pathItem);
      return pathItem;
    }

    const newPathItem = { ...pathItem };

    const httpMethodSet = this[httpMethodSetSymbol];
    for (const [method, operation] of Object.entries(pathItem)) {
      if (operation !== undefined && httpMethodSet.has(method.toLowerCase())) {
        newPathItem[method] = visit(
          this,
          this.transformOperation,
          method,
          operation,
        );
      }
    }

    return newPathItem;
  }

  transformOperation(operation) {
    if (typeof operation !== 'object'
      || operation === null
      || Array.isArray(operation)) {
      this.warn('Ignoring non-object Operation', operation);
      return operation;
    }

    const { requestBody, ...newOperation } = operation;

    const { parameters } = operation;
    if (parameters !== undefined) {
      if (!Array.isArray(parameters)) {
        this.transformPath.push('parameters');
        this.warn('Ignoring non-Array Parameters', parameters);
        this.transformPath.pop();
      } else {
        newOperation.parameters = parameters
          .filter((parameter) => !parameter
            || (parameter.in !== 'formData' && parameter.in !== 'body'));
      }
    }

    return newOperation;
  }
}
