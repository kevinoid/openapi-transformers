#!/usr/bin/env node
/**
 * Script to convert known formats in an OAS3 doc to types (for Autorest).
 *
 * Autorest doesn't generate int/decimal/double properties for type: string.
 * Change the type to generate as desired.
 *
 * @copyright Copyright 2019 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

'use strict';

const { readFile, writeFile } = require('./lib/file-utils.js');
const OpenApiTransformerBase = require('openapi-transformer-base');

function transformSchemaType(schema) {
  if (schema.type === 'string') {
    const formatToType = {
      decimal: 'number',
      double: 'number',
      float: 'number',
      integer: 'integer',
      int32: 'integer',
      int64: 'integer',
    };
    const newType = formatToType[schema.format];
    if (newType) {
      const newSchema = {
        ...schema,
        type: newType,
      };
      if (newSchema.format === 'integer') {
        // format: integer is redundant with type: integer
        delete newSchema.format;
      }
      return newSchema;
    }
  }

  return schema;
}

class FormatToTypeTransformer extends OpenApiTransformerBase {
  transformSchema(schema) {
    return transformSchemaType(super.transformSchema(schema));
  }

  transformParameter(parameter) {
    return transformSchemaType(super.transformParameter(parameter));
  }

  transformHeader(header) {
    return transformSchemaType(super.transformHeader(header));
  }
}

module.exports = FormatToTypeTransformer;

function convertFormatToType(spec) {
  const transformer = new FormatToTypeTransformer();
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
    .then((specStr) => convertFormatToType(JSON.parse(specStr)))
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
