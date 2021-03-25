#!/usr/bin/env node
/**
 * Script to prefix operationId with the first tag name and an underscore,
 * which Autorest recognizes as an "operation group" represented by a separate
 * API class when generating the client.
 *
 * See https://github.com/Azure/autorest/issues/1497#issuecomment-252082163
 *
 * @copyright Copyright 2019 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

'use strict';

const { readFile, writeFile } = require('./lib/file-utils.js');
const OpenApiTransformerBase = require('openapi-transformer-base');

class AddTagToOperationIdsTransformer extends OpenApiTransformerBase {
  constructor(options) {
    super();
    this.tagSuffix = String((options && options.tagSuffix) || '');
  }

  transformOperation(op) {
    if (!op.tags || !op.operationId) {
      return op;
    }

    return {
      ...op,
      operationId: `${op.tags[0]}${this.tagSuffix}_${op.operationId}`,
    };
  }

  // Override as performance optimization, since only transforming paths
  transformOpenApi(spec) {
    return {
      ...spec,
      paths: this.transformPaths(spec.paths),
    };
  }
}

module.exports = AddTagToOperationIdsTransformer;

function addTagToOperationIdsInSpec(spec, options) {
  const transformer = new AddTagToOperationIdsTransformer(options);
  return transformer.transformOpenApi(spec);
}

function main(args, options, cb) {
  // TODO: Proper command-line parsing

  let i = 2;
  if (args[i] === '--help') {
    options.stdout.write(`Usage: ${args[1]} [input] [output]\n`);
    cb(0);
    return;
  }

  let tagSuffix = '';
  if (args[i] === '-s' || args[i] === '--tag-suffix') {
    tagSuffix = args[i + 1];
    i += 2;
  }

  const inputPathOrDesc = !args[i] || args[i] === '-' ? 0 : args[i];
  i += 1;
  const outputPathOrDesc = !args[i] || args[i] === '-' ? 1 : args[i];

  // eslint-disable-next-line promise/catch-or-return
  readFile(inputPathOrDesc, { encoding: 'utf8' })
    .then((v3SpecStr) => addTagToOperationIdsInSpec(
      JSON.parse(v3SpecStr),
      { tagSuffix },
    ))
    .then((v2Spec) => writeFile(
      outputPathOrDesc,
      JSON.stringify(v2Spec, undefined, 2),
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
