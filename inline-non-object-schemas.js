#!/usr/bin/env node
/**
 * Script to inline schemas with non-object type so that Autorest will
 * generate validation code.
 *
 * https://github.com/Azure/autorest.csharp/issues/795
 *
 * @copyright Copyright 2020 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

'use strict';

const util = require('util');
const { JsonPointer } = require('json-ptr');

const { readFile, writeFile } = require('./lib/file-utils.js');
const OpenApiTransformerBase = require('openapi-transformer-base');

const debuglog = util.debuglog('inline-non-object-schemas');

// JSON Schema validation keywords supported by Autorest which must be inlined
// https://github.com/Azure/azure-sdk-for-net/blob/master/sdk/mgmtcommon/ClientRuntime/ClientRuntime/ValidationRules.cs
// Note: exclusiveMaximum/Minimum only modify maximum/minimum validation.
const validationKeywords = {
  maxItems: true,
  maxLength: true,
  maximum: true,
  minItems: true,
  minLength: true,
  minimum: true,
  multipleOf: true,
  pattern: true,
  uniqueItems: true,
};

class InlineNonObjectSchemaTransformer extends OpenApiTransformerBase {
  constructor(options) {
    super();
    this.options = options;
  }

  transformSchema(schema) {
    const { $ref, ...nonRef } = schema;
    if (typeof $ref !== 'string') {
      return super.transformSchema(schema);
    }

    const refSchema = this.options.resolveRef($ref);
    if (refSchema === undefined) {
      debuglog('Unable to resolve $ref %s', $ref);
      return super.transformSchema(schema);
    }

    if (!refSchema || !refSchema.type || refSchema.type === 'object') {
      debuglog('Not inlining %s: type %s', $ref, refSchema && refSchema.type);
      return super.transformSchema(schema);
    }

    if (refSchema.enum) {
      debuglog('Not inlining %s: enum', $ref);
      return super.transformSchema(schema);
    }

    if (!this.options.inlineAll
      && !Object.keys(refSchema).some((prop) => validationKeywords[prop])) {
      debuglog(
        'Not inlining %s: No validation keywords require inlining',
        $ref,
      );
      return super.transformSchema(schema);
    }

    debuglog('Inlining %s.', $ref);
    return {
      ...super.transformSchema(refSchema),
      // Like Autorest, allow properties other than $ref
      ...nonRef,
    };
  }
}

module.exports = InlineNonObjectSchemaTransformer;

function inlineNonObjectSchemas(openapi, options) {
  function resolveRef($ref) {
    // JsonPointer.get would throw for non-local refs
    return $ref[0] === '#' ? JsonPointer.get(openapi, $ref) : undefined;
  }
  const transformer = new InlineNonObjectSchemaTransformer({
    ...options,
    resolveRef,
  });
  return transformer.transformOpenApi(openapi);
};

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
    .then((specStr) => inlineNonObjectSchemas(JSON.parse(specStr)))
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
};

if (require.main === module) {
  // This file was invoked directly.
  main(process.argv, process, (exitCode) => {
    process.exitCode = exitCode;
  });
}
