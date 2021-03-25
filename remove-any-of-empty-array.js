#!/usr/bin/env node
/**
 * Script to remove empty arrays from anyOf and oneOf schemas.  Empty arrays
 * are returned in place of empty objects by the BambooHR API in some places
 * (e.g. TimeOffRequest.notes) and anyOf/oneOf are not currently supported by
 * code generators (except for inheritance).
 *
 * @copyright Copyright 2019 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

'use strict';

const OpenApiTransformerBase = require('openapi-transformer-base');
const { readFile, writeFile } = require('./lib/file-utils.js');

function isNotEmptyArraySchema(schema) {
  return schema.type !== 'array' || schema.maxItems !== 0;
}

class RemoveAnyOfEmptyArrayTransformer extends OpenApiTransformerBase {
  transformSchema(schema) {
    let newSchema = super.transformSchema(schema);

    for (const anyOneOfName of ['anyOf', 'oneOf']) {
      const anyOneOf = newSchema[anyOneOfName];
      if (Array.isArray(anyOneOf)) {
        const newAnyOneOf = anyOneOf.filter(isNotEmptyArraySchema);
        if (newAnyOneOf.length !== anyOneOf.length) {
          if (newAnyOneOf.length === 1 && Object.keys(newSchema).length === 1) {
            // anyOf/oneOf with one choice is the only schema property.
            // Use the schema directly.
            [newSchema] = newAnyOneOf;
          } else {
            newSchema = {
              ...newSchema,
              [anyOneOfName]: newAnyOneOf,
            };
          }
        }
      }
    }

    return newSchema;
  }
}

module.exports = RemoveAnyOfEmptyArrayTransformer;

function removeAnyOfEmptyArray(spec) {
  const transformer = new RemoveAnyOfEmptyArrayTransformer();
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
    .then((specStr) => removeAnyOfEmptyArray(JSON.parse(specStr)))
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
