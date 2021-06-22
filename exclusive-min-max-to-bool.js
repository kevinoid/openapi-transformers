/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 * @module "openapi-transformers/exclusive-min-max-to-bool.js"
 */

import OpenApiTransformerBase from 'openapi-transformer-base';

/**
 * Transform Schema Objects with numeric values for `exclusiveMaximum` and/or
 * `exclusiveMinimum` (as in JSON Schema Draft 2020-12 referenced by OAS 3.1.0:
 * https://datatracker.ietf.org/doc/html/draft-bhutton-json-schema-validation-00#section-6.2.3
 * ) to boolean values with corresponding `maximum` and/or `minimum` (as in
 * JSON Schema Write 00 referenced by OAS 3.0:
 * https://datatracker.ietf.org/doc/html/draft-wright-json-schema-validation-00#section-5.3
 * and JSON Schema Draft 4 referenced by OAS 2:
 * https://datatracker.ietf.org/doc/html/draft-fge-json-schema-validation-00#section-5.1.2
 * ).
 */
export default class ExclusiveMinMaxToBoolTransformer
  extends OpenApiTransformerBase {
  transformSchema(schema) {
    schema = super.transformSchema(schema);
    if (schema === null
      || typeof schema !== 'object'
      || Array.isArray(schema)) {
      return schema;
    }

    const exclusiveMaximum = +schema.exclusiveMaximum;
    const exclusiveMinimum = +schema.exclusiveMinimum;
    if (Number.isNaN(exclusiveMaximum) && Number.isNaN(exclusiveMinimum)) {
      return schema;
    }

    const newSchema = { ...schema };

    if (!Number.isNaN(exclusiveMaximum)) {
      const { maximum } = schema;
      if (maximum < exclusiveMaximum) {
        delete newSchema.exclusiveMaximum;
      } else {
        newSchema.maximum = exclusiveMaximum;
        newSchema.exclusiveMaximum = true;
      }
    }

    if (!Number.isNaN(exclusiveMinimum)) {
      const { minimum } = schema;
      if (minimum > exclusiveMinimum) {
        delete newSchema.exclusiveMinimum;
      } else {
        newSchema.minimum = exclusiveMinimum;
        newSchema.exclusiveMinimum = true;
      }
    }

    return newSchema;
  }
}
