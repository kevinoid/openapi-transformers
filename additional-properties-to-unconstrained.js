#!/usr/bin/env node
/**
 * Script to replace additionalProperties (and patternProperties) with an
 * unconstrained schema alongside other properties to work around
 * https://github.com/Azure/autorest/issues/2469
 *
 * @copyright Copyright 2019-2020 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

'use strict';

const OpenApiTransformerBase = require('openapi-transformer-base');
const { readFile, writeFile } = require('./lib/file-utils.js');

/** Applies a predicate to each schema which contributes to the generated
 * type of a given schema.
 *
 * @private
 */
function someCombinedSchema(schema, predicate) {
  if (predicate(schema)) {
    return true;
  }

  if (typeof schema !== 'object' || schema === null) {
    return false;
  }

  if (['then', 'else'].some(
    (key) => someCombinedSchema(schema[key], predicate),
  )) {
    return true;
  }

  return ['allOf', 'anyOf', 'oneOf'].some(
    (key) => Array.isArray(schema[key])
      && schema[key].some((s) => someCombinedSchema(s, predicate)),
  );
}

/** Replaces additionalProperties (and patternProperties) in each schema which
 * contributes to the generated type of a given schema.
 *
 * @private
 */
function replaceAdditionalProperties(schema) {
  if (typeof schema !== 'object' || schema === null) {
    return schema;
  }

  const newSchema = { ...schema };

  for (const key of ['additionalProperties', 'patternProperties']) {
    const propSchema = newSchema[key];
    if (typeof propSchema === 'object' && propSchema !== null) {
      // Note: Use {} instead of true to work around
      // https://github.com/Azure/autorest/issues/3439 and
      // https://github.com/Azure/autorest/issues/2564 (marked fixed, but fix
      // only covers additionalProperties on top-level schemas)
      newSchema[key] = {};
    }
  }

  for (const key of ['then', 'else']) {
    if (newSchema[key] !== undefined) {
      newSchema[key] = replaceAdditionalProperties(newSchema[key]);
    }
  }

  for (const key of ['allOf', 'anyOf', 'oneOf']) {
    if (Array.isArray(newSchema[key])) {
      newSchema[key] = newSchema[key].map(replaceAdditionalProperties);
    }
  }

  return newSchema;
}

/** Does a schema describe an object with at least one property?
 *
 * @private
 */
function hasProperties(schema) {
  return schema
    && schema.properties
    && Object.keys(schema.properties).length > 0;
}

/** Does a schema describe an object with constrained additionalProperties
 * (or patternProperties)?
 *
 * @private
 */
function hasConstrainedAdditionalProps(schema) {
  return schema
    && ((schema.additionalProperties
        && Object.keys(schema.additionalProperties).length > 0)
      || (schema.patternProperties
        && Object.keys(schema.patternProperties).length > 0));
}

class AdditionalPropertiesToUnconstrainedTransformer
  extends OpenApiTransformerBase {
  transformSchema(schema) {
    let newSchema;
    if (someCombinedSchema(schema, hasConstrainedAdditionalProps)
      && someCombinedSchema(schema, hasProperties)) {
      newSchema = replaceAdditionalProperties(schema);
    } else {
      newSchema = schema;
    }

    // Search for additionalProperties in child schemas
    return super.transformSchema(newSchema);
  }
}

module.exports = AdditionalPropertiesToUnconstrainedTransformer;

function additionalPropertiesToUnconstrained(spec) {
  const transformer = new AdditionalPropertiesToUnconstrainedTransformer();
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
    .then((specStr) => additionalPropertiesToUnconstrained(
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
