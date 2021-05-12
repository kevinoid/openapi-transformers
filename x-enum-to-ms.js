/**
 * @copyright Copyright 2019 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import { debuglog } from 'util';

import OpenApiTransformerBase from 'openapi-transformer-base';

const debug = debuglog('x-enum-to-ms');

function transformSchemaXEnumToXMsEnum(schema, schemaName) {
  if ((!schema['x-enum-descriptions'] && !schema['x-enum-varnames'])
      || (schema['x-ms-enum'] && schema['x-ms-enum'].values)) {
    // Schema doesn't have enum varnames/descriptions to convert,
    // or already has x-ms-enum.values
    return schema;
  }

  const {
    'x-enum-descriptions': descriptions,
    'x-enum-varnames': varnames,
    ...newSchema
  } = schema;

  const xMsEnum = {
    // Make name first in output for aesthetics
    name: undefined,
    ...newSchema['x-ms-enum'],
    values: newSchema.enum.map((value, i) => ({
      value,
      description: descriptions ? descriptions[i] : undefined,
      name: varnames ? varnames[i] : undefined,
    })),
  };

  if (!xMsEnum.name) {
    if (!schemaName) {
      debug('Unable to determine required x-ms-enum.name for %O', schema);
      return schema;
    }

    xMsEnum.name = schemaName;
  }

  newSchema['x-ms-enum'] = xMsEnum;
  return newSchema;
}

/**
 * Transformer to convert x-enum-descriptions and x-enum-varnames to x-ms-enum
 * for Autorest.
 *
 * https://github.com/OpenAPITools/openapi-generator/blob/master/docs/templating.md#enum
 * https://github.com/Azure/autorest/tree/master/docs/extensions#x-ms-enum
 */
export default class XEnumToXMsEnumTransformer extends OpenApiTransformerBase {
  transformSchema(schema, schemaName) {
    return transformSchemaXEnumToXMsEnum(
      super.transformSchema(schema),
      schemaName,
    );
  }

  // Override to pass schemaName as second argument to transformSchema
  transformMap(obj, transform) {
    if (transform !== this.transformSchema) {
      return super.transformMap(obj, transform);
    }

    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
      return obj;
    }

    const newObj = { ...obj };
    for (const [propName, propValue] of Object.entries(obj)) {
      if (propValue !== undefined) {
        newObj[propName] = transform.call(this, propValue, propName);
      }
    }

    return newObj;
  }

  transformParameter(parameter) {
    return transformSchemaXEnumToXMsEnum(
      super.transformParameter(parameter),
      undefined,
    );
  }
}
