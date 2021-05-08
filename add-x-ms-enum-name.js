/**
 * Script to convert add x-ms-enum.name from schema name, if not present
 * (so Autorest will generate enum types).
 *
 * https://github.com/Azure/autorest/tree/master/docs/extensions#x-ms-enum
 *
 * @copyright Copyright 2019 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

'use strict';

const OpenApiTransformerBase = require('openapi-transformer-base');

class AddXMsEnumNameTransformer extends OpenApiTransformerBase {
  // eslint-disable-next-line class-methods-use-this
  transformSchema(schema, schemaName) {
    if (!schema.enum || (schema['x-ms-enum'] && schema['x-ms-enum'].name)) {
      return schema;
    }

    return {
      ...schema,
      'x-ms-enum': {
        ...schema['x-ms-enum'],
        name: schemaName,
      },
    };
  }

  /** Transforms Map[string,Schema] with named schemas by passing the
   * name as the second argument to transformSchema.
   *
   * @param {!object<string,object>|*} schemas Schmea map to transform.
   * @returns {!object<string,object>|*} If obj is a Map, a plain object with
   * the same own enumerable string-keyed properties as obj with values
   * returned by transformSchema.  Otherwise, obj is returned unchanged.
   */
  transformSchemas(schemas) {
    if (typeof schemas !== 'object'
      || schemas === null
      || Array.isArray(schemas)) {
      return schemas;
    }

    const newSchemas = { ...schemas };
    for (const [schemaName, schema] of Object.entries(schemas)) {
      if (schema !== undefined) {
        newSchemas[schemaName] = this.transformSchema(schema, schemaName);
      }
    }

    return newSchemas;
  }

  // Optimization: Only transform schemas
  transformComponents(components) {
    if (!components) {
      return components;
    }

    const { schemas } = components;
    if (!schemas) {
      return components;
    }

    return {
      ...components,
      schemas: this.transformSchemas(schemas),
    };
  }

  // Optimization: Only transform components/definitions
  transformOpenApi(openApi) {
    if (!openApi) {
      return openApi;
    }

    const { components, definitions } = openApi;
    if (!components && !definitions) {
      return openApi;
    }

    const newOpenApi = { ...openApi };

    if (components) {
      newOpenApi.components = this.transformComponents(components);
    }

    if (definitions) {
      newOpenApi.definitions = this.transformSchemas(definitions);
    }

    return newOpenApi;
  }
}

module.exports = AddXMsEnumNameTransformer;
