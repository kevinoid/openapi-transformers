/**
 * @copyright Copyright 2024 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 * @module "openapi-transformers/remove-ref-siblings.js"
 */

import OpenApiTransformerBase from 'openapi-transformer-base';

/**
 * Transformer to remove properties from Reference Objects.
 *
 * OpenAPI Specification 2.0 and 3.0 forbid properties other than $ref on
 * Reference Object.  OAS 3.1 relaxed the restriction to allow summary and
 * description on all Reference Objects and all properties on Schema Objects
 * (due to changes in the referenced version of JSON Schema).  There is
 * discussion of allowing more:
 * https://github.com/OAI/OpenAPI-Specification/issues/2026
 * https://github.com/OAI/OpenAPI-Specification/issues/2498
 *
 * Note: Autorest supports description, title, readonly, nullable, and x-*
 * properties:
 * https://github.com/Azure/autorest/blob/main/docs/openapi/howto/$ref-siblings.md
 */
export default class RemoveRefSiblingsTransformer
  extends OpenApiTransformerBase {
  constructor({ remove, retain } = {}) {
    super();

    if (remove !== undefined && retain !== undefined) {
      throw new Error('remove and retain options are exclusive');
    }

    if (typeof remove === 'function') {
      this.removeSchemaRefProp = remove;
    } else if (remove !== undefined) {
      const removeSet = new Set(remove);
      this.removeSchemaRefProp = (propName) => removeSet.has(propName);
    } else if (typeof retain === 'function') {
      this.removeSchemaRefProp = (propName) => !retain(propName);
    } else if (retain !== undefined) {
      const retainSet = new Set(retain);
      this.removeSchemaRefProp = (propName) => !retainSet.has(propName);
    }
  }

  /** Should a property on a Schema Object with $ref be removed?
   *
   * @param {string} propName Name of the property.
   * @param {!object} schema Schema Object.
   * @returns {boolean} <c>true</c> if <c>propName</c> should be removed,
   * otherwise <c>false</c>.
   */
  // eslint-disable-next-line class-methods-use-this
  removeSchemaRefProp(propName, schema) {
    return true;
  }

  transformSchema(schema) {
    const newSchema = super.transformSchema(schema);
    if (!newSchema) {
      return newSchema;
    }

    const { $ref } = newSchema;
    if ($ref === undefined) {
      return newSchema;
    }

    const removedSchema = { $ref };
    for (const [propName, propVal] of Object.entries(newSchema)) {
      if (!this.removeSchemaRefProp(propName, newSchema)) {
        removedSchema[propName] = propVal;
      }
    }

    return removedSchema;
  }
}
