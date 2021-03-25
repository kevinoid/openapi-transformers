#!/usr/bin/env node
/**
 * Script to replace `type: string, format: binary` (or `format: file`) with
 * `type: file` so that Autorest generates to a Stream instead of string.
 *
 * @copyright Copyright 2019 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

'use strict';

const { readFile, writeFile } = require('./lib/file-utils.js');
const OpenApiTransformerBase = require('openapi-transformer-base');

function transformSchemaType(schema) {
  if (schema.type === 'string'
      && (schema.format === 'binary' || schema.format === 'file')) {
    const newSchema = {
      ...schema,
      type: 'file',
    };
    delete newSchema.format;
    return newSchema;
  }

  return schema;
}

class BinaryStringToFileTransformer extends OpenApiTransformerBase {
  // eslint-disable-next-line class-methods-use-this
  transformSchema(schema) {
    // Don't call super, since `type: file` is only allowed on root schema of
    // response.
    // Note: No checking is done to enforce this (due to $ref complications).
    // Note: A response could $ref a property schema.  Unlikely.
    return transformSchemaType(schema);
  }

  // eslint-disable-next-line class-methods-use-this
  transformParameter(parameter) {
    // Since `type: file` is not supported in OAS3,
    // no need to transform .schema property
    return transformSchemaType(parameter);
  }
}

module.exports = BinaryStringToFileTransformer;

function convertBinaryStringToFile(spec) {
  const transformer = new BinaryStringToFileTransformer();
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
    .then((specStr) => convertBinaryStringToFile(JSON.parse(specStr)))
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
