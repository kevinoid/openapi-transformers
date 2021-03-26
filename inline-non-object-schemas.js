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

const { debuglog } = require('util');
const { JsonPointer } = require('json-ptr');

const OpenApiTransformerBase = require('openapi-transformer-base');
const { readFile, writeFile } = require('./lib/file-utils.js');

const debug = debuglog('inline-non-object-schemas');

const inlineAllSymbol = Symbol('inlineAll');
const resolveRefSymbol = Symbol('resolveRef');

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

    if (options !== undefined
      && (options === null || typeof options !== 'object')) {
      throw new TypeError('options must be an object');
    }

    const { inlineAll, resolveRef } = options || {};
    if (inlineAll !== undefined && typeof inlineAll !== 'boolean') {
      throw new TypeError('inlineAll must be a boolean');
    }

    if (resolveRef !== undefined && typeof resolveRef !== 'function') {
      throw new TypeError('resolveRef must be a function');
    }

    this[inlineAllSymbol] = Boolean(inlineAll);
    this[resolveRefSymbol] = resolveRef;
  }

  transformSchema(schema) {
    const { $ref, ...nonRef } = schema;
    if (typeof $ref !== 'string') {
      return super.transformSchema(schema);
    }

    const refSchema = this[resolveRefSymbol]($ref);
    if (refSchema === undefined) {
      debug('Unable to resolve $ref %s', $ref);
      return super.transformSchema(schema);
    }

    if (!refSchema || !refSchema.type || refSchema.type === 'object') {
      debug('Not inlining %s: type %s', $ref, refSchema && refSchema.type);
      return super.transformSchema(schema);
    }

    if (refSchema.enum) {
      debug('Not inlining %s: enum', $ref);
      return super.transformSchema(schema);
    }

    if (!this[inlineAllSymbol]
      && !Object.keys(refSchema).some((prop) => validationKeywords[prop])) {
      debug(
        'Not inlining %s: No validation keywords require inlining',
        $ref,
      );
      return super.transformSchema(schema);
    }

    debug('Inlining %s.', $ref);
    return {
      ...super.transformSchema(refSchema),
      // Like Autorest, allow properties other than $ref
      ...nonRef,
    };
  }

  transformOpenApi(openapi) {
    // If resolveRefSymbol was not set from options, resolve against OpenAPI
    // Object being transformed.
    const optResolve = this[resolveRefSymbol];
    if (!optResolve) {
      this[resolveRefSymbol] = function resolveRef($ref) {
        // JsonPointer.get would throw for non-local refs
        return $ref[0] === '#' ? JsonPointer.get(openapi, $ref) : undefined;
      };
    }

    try {
      return super.transformOpenApi(openapi);
    } finally {
      if (optResolve) {
        this[resolveRefSymbol] = optResolve;
      }
    }
  }
}

module.exports = InlineNonObjectSchemaTransformer;

function inlineNonObjectSchemas(openapi, options) {
  const transformer = new InlineNonObjectSchemaTransformer(options);
  return transformer.transformOpenApi(openapi);
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
}

if (require.main === module) {
  // This file was invoked directly.
  main(process.argv, process, (exitCode) => {
    process.exitCode = exitCode;
  });
}
