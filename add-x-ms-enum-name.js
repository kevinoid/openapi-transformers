#!/usr/bin/env node
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

const { readFile, writeFile } = require('./lib/file-utils.js');
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

  // Override to pass schemaName as second argument to transformSchema
  transformSchemas(schemas) {
    return Object.keys(schemas)
      .reduce((newSchemas, schemaName) => {
        newSchemas[schemaName] =
          this.transformSchema(schemas[schemaName], schemaName);
        return newSchemas;
      }, Object.create(Object.getPrototypeOf(schemas)));
  }

  // Optimization: Only transform schemas
  transformOpenApi(spec) {
    const newSpec = { ...spec };

    if (spec.components && spec.components.schemas) {
      newSpec.components = {
        ...newSpec.components,
        schemas: this.transformSchemas(newSpec.components.schemas),
      };
    }

    if (spec.definitions) {
      newSpec.definitions = this.transformSchemas(spec.definitions);
    }

    return newSpec;
  }
}

module.exports = AddXMsEnumNameTransformer;

function addXMsEnumName(spec) {
  const transformer = new AddXMsEnumNameTransformer();
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
    .then((specStr) => addXMsEnumName(JSON.parse(specStr)))
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
