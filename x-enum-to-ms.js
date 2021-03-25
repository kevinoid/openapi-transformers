#!/usr/bin/env node
/**
 * Script to convert x-enum-descriptions and x-enum-varnames to x-ms-enum
 * for Autorest.
 *
 * https://github.com/OpenAPITools/openapi-generator/blob/master/docs/templating.md#enum
 * https://github.com/Azure/autorest/tree/master/docs/extensions#x-ms-enum
 *
 * @copyright Copyright 2019 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

'use strict';

const OpenApiTransformerBase = require('openapi-transformer-base');
const { readFile, writeFile } = require('./lib/file-utils.js');

function transformSchemaXEnumToXMsEnum(schema, schemaName, options) {
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
      // x-ms-enum.name is required.  Bail if it can't be determined.
      options.stderr.write(
        'Error converting x-ms-enum: Unable to determine schema name.\n',
      );
      return schema;
    }

    xMsEnum.name = schemaName;
  }

  newSchema['x-ms-enum'] = xMsEnum;
  return newSchema;
}

class XEnumToXMsEnumTransformer extends OpenApiTransformerBase {
  constructor(options) {
    super();
    this.options = options;
  }

  transformSchema(schema, schemaName) {
    return transformSchemaXEnumToXMsEnum(
      super.transformSchema(schema),
      schemaName,
      this.options,
    );
  }

  // Override to pass schemaName as second argument to transformSchema
  transformSchemas(schemas) {
    return Object.keys(schemas)
      .reduce((newSchemas, schemaName) => {
        newSchemas[schemaName] =
          this.transformSchema(schemas[schemaName], schemaName);
        return newSchemas;
      }, Object.create(Object.getPrototypeOf(schemas)));
  }

  transformParameter(parameter) {
    return transformSchemaXEnumToXMsEnum(
      super.transformParameter(parameter),
      undefined,
      this.options,
    );
  }
}

module.exports = XEnumToXMsEnumTransformer;

function convertXEnumToXMsEnum(spec, options) {
  const transformer = new XEnumToXMsEnumTransformer(options);
  return transformer.transformOpenApi(spec);
}

function main(args, options, cb) {
  if (args[2] === '--help') {
    options.stdout.write(`Usage: ${args[1]} [input] [output]\n`);
    cb(0);
    return;
  }

  const inputPathOrDesc = !args[2] || args[2] === '-' ? 0 : args[2];
  const outputPathOrDesc = !args[3] || args[3] === '-' ? 1 : args[3];

  // eslint-disable-next-line promise/catch-or-return
  readFile(inputPathOrDesc, { encoding: 'utf8' })
    .then((specStr) => convertXEnumToXMsEnum(JSON.parse(specStr), options))
    .then((spec) => writeFile(
      outputPathOrDesc,
      JSON.stringify(spec, undefined, 2),
    ))
    .then(
      () => cb(0),  // eslint-disable-line promise/no-callback-in-promise
      (err) => {
        options.stderr.write(`${err.stack}\n`);
        cb(1);  // eslint-disable-line promise/no-callback-in-promise
      },
    );
}

if (require.main === module) {
  // This file was invoked directly.
  main(process.argv, process, (exitCode) => {
    process.exitCode = exitCode;
  });
}
