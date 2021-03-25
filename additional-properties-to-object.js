#!/usr/bin/env node
/**
 * Script to replace boolean additionalProperties with an object schema to
 * work around https://github.com/Azure/autorest/issues/3439.
 *
 * @copyright Copyright 2019 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

'use strict';

const OpenApiTransformerBase = require('openapi-transformer-base');
const { readFile, writeFile } = require('./lib/file-utils.js');

class AdditionalPropertiesToObjectTransformer extends OpenApiTransformerBase {
  transformSchema(schema) {
    if (typeof schema !== 'object' || schema === null) {
      return schema;
    }

    const newSchema = super.transformSchema(schema);
    const { additionalProperties } = newSchema;

    if (typeof additionalProperties !== 'boolean') {
      return newSchema;
    }

    return {
      ...newSchema,

      // Use schema equivalents described by current spec author Henry Andrews
      // https://groups.google.com/d/msg/json-schema/Es0fEf3hj2Y/MxWmgercBAAJ
      additionalProperties: additionalProperties ? {} : { not: {} },
    };
  }
}

module.exports = AdditionalPropertiesToObjectTransformer;

function additionalPropertiesToObject(spec) {
  const transformer = new AdditionalPropertiesToObjectTransformer();
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
    .then((specStr) => additionalPropertiesToObject(
      JSON.parse(specStr),
    ))
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
