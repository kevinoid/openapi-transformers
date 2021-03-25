#!/usr/bin/env node
/**
 * Script to replace schemas using allOf/anyOf/oneOf with a single child schema
 * by the child schema with parent attributes applied.
 *
 * Schemas which use the workaround suggested by Ian Goncharov
 * https://github.com/OAI/OpenAPI-Specification/issues/556#issuecomment-192007034
 * in order to define properties with a $ref type and additional attributes
 * (e.g. description, deprecated, xml) will not work with Autorest due to
 * Azure/autorest#2652 and Azure/autorest#3417.  Support for Autorest can be
 * achieved by moving the attributes onto the $ref object (which violates OAS
 * and JSON Reference, but is accepted by Autorest), as done by this script.
 *
 * @copyright Copyright 2019 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

'use strict';

const { debuglog, isDeepStrictEqual } = require('util');

const OpenApiTransformerBase = require('openapi-transformer-base');
const { readFile, writeFile } = require('./lib/file-utils.js');

const debug = debuglog('collapse-single-of');

function hasCollision(schema, ofSchema, ofName) {
  return Object.keys(schema)
    .some((prop) => {
      if (hasOwnProperty.call(ofSchema, prop)
        && !isDeepStrictEqual(schema[prop], ofSchema[prop])) {
        debug('Not collapsing %O due to differing %O', ofName, prop);
        return true;
      }

      return false;
    });
}

class CollapseSingleOfTransformer extends OpenApiTransformerBase {
  transformSchema(schema) {
    let newSchema = super.transformSchema(schema);

    for (const ofName of ['allOf', 'anyOf', 'oneOf']) {
      const ofSchemas = newSchema[ofName];
      if (Array.isArray(ofSchemas)
          && ofSchemas.length === 1
          && !hasCollision(newSchema, ofSchemas[0], ofName)) {
        newSchema = {
          ...newSchema,
          ...ofSchemas[0],
        };
        delete newSchema[ofName];
      }
    }

    return newSchema;
  }
}

module.exports = CollapseSingleOfTransformer;

function collapseSingleOf(spec) {
  const transformer = new CollapseSingleOfTransformer();
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
    .then((specStr) => collapseSingleOf(JSON.parse(specStr)))
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
