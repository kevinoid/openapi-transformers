#!/usr/bin/env node
/**
 * Convert x-deprecated.replaced-by to x-deprecated.description, if not present.
 *
 * Since Autorest C# doesn't use replaced-by, but does use description.
 *
 * @copyright Copyright 2019 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

'use strict';

const OpenApiTransformerBase = require('openapi-transformer-base');
const { readFile, writeFile } = require('./lib/file-utils.js');

function transformXDeprecated(schema) {
  const xDeprecated = schema['x-deprecated'];
  if (xDeprecated
      && !hasOwnProperty.call(xDeprecated, 'description')
      && hasOwnProperty.call(xDeprecated, 'replaced-by')) {
    return {
      ...schema,
      'x-deprecated': {
        description: `Use ${xDeprecated['replaced-by']} instead.`,
        ...xDeprecated,
      },
    };
  }

  return schema;
}

class ReplacedByToDescriptionTransformer extends OpenApiTransformerBase {
  transformSchema(schema) {
    return transformXDeprecated(super.transformSchema(schema));
  }

  transformParameter(parameter) {
    return transformXDeprecated(super.transformParameter(parameter));
  }

  transformHeader(header) {
    return transformXDeprecated(super.transformHeader(header));
  }

  transformOperation(operation) {
    return transformXDeprecated(super.transformOperation(operation));
  }
}

module.exports = ReplacedByToDescriptionTransformer;

function convertReplacedByToDescription(spec) {
  const transformer = new ReplacedByToDescriptionTransformer();
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
    .then((specStr) => convertReplacedByToDescription(
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
