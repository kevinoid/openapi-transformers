#!/usr/bin/env node
/**
 * Script to make properties which are nullable non-required to work around
 * partial support for x-nullable in Autorest.  Currently nullable data types
 * are used (e.g. Nullable<int>) but the Validate() method doesn't allow null.
 * See:  https://github.com/Azure/autorest/issues/3300
 *
 * @copyright Copyright 2019 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

'use strict';

const OpenApiTransformerBase = require('openapi-transformer-base');
const { readFile, writeFile } = require('./lib/file-utils.js');

function isNullable(schema, propName) {
  const {
    additionalProperties,
    allOf,
    anyOf,
    oneOf,
    properties,
  } = schema;
  if (properties && hasOwnProperty.call(properties, propName)) {
    const propSchema = properties[propName];
    if (!propSchema.nullable && !propSchema['x-nullable']) {
      // schema in properties does not allow null
      return false;
    }
  } else if (additionalProperties === false) {
    // would fail validation if property is present
    return false;
  } else if (typeof additionalProperties === 'object'
      && !additionalProperties.nullable
      && !additionalProperties['x-nullable']) {
    // schema in additionalProperties does not allow null
    return false;
  }

  if (allOf
    && !allOf.every((allSchema) => isNullable(allSchema, propName))) {
    // at least one schema in allOf does not allow null
    return false;
  }

  if (anyOf
    && !anyOf.some((anySchema) => isNullable(anySchema, propName))) {
    // no schema in anyOf allows null
    return false;
  }

  if (oneOf
    && !oneOf.some((oneSchema) => isNullable(oneSchema, propName))) {
    // no schema in oneOf allows null
    return false;
  }

  return true;
}

class NullableNotRequiredTransformer extends OpenApiTransformerBase {
  transformSchema(schema) {
    const newSchema = super.transformSchema(schema);
    if (!newSchema.required) {
      return newSchema;
    }

    return {
      ...newSchema,
      required: newSchema.required
        .filter((reqName) => !isNullable(newSchema, reqName)),
    };
  }
}

module.exports = NullableNotRequiredTransformer;

function nullableNotRequired(spec) {
  const transformer = new NullableNotRequiredTransformer();
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
    .then((specStr) => nullableNotRequired(
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
