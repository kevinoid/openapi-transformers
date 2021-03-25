#!/usr/bin/env node
/**
 * Move Parameters defined on Path Item Objects to global parameters which
 * are referenced in the Path Item so that Autorest will treat them as
 * properties of the generated client, rather than method.
 * https://github.com/Azure/autorest/tree/master/docs/extensions#x-ms-parameter-location
 *
 * @copyright Copyright 2019 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

'use strict';

const assert = require('assert');
const OpenApiTransformerBase = require('openapi-transformer-base');
const { readFile, writeFile } = require('./lib/file-utils.js');

class RefPathParametersTransformer extends OpenApiTransformerBase {
  transformPathItem(pathItem) {
    if (!pathItem.parameters) {
      return pathItem;
    }

    return {
      ...pathItem,
      parameters: pathItem.parameters.map((param) => {
        if (param.$ref) {
          return param;
        }

        const gparam = this.parameters[param.name];
        if (gparam) {
          assert.deepStrictEqual(gparam, param);
        } else {
          this.parameters[param.name] = param;
        }

        return { $ref: this.paramRefPrefix + param.name };
      }),
    };
  }

  transformOpenApi(spec) {
    const newSpec = { ...spec };

    if (spec.swagger) {
      newSpec.parameters = { ...newSpec.parameters };
      this.parameters = newSpec.parameters;
      this.paramRefPrefix = '#/parameters/';
    } else {
      newSpec.components = { ...newSpec.components };
      newSpec.components.parameters = { ...newSpec.components.parameters };
      this.parameters = newSpec.components.parameters;
      this.paramRefPrefix = '#/components/parameters/';
    }

    newSpec.paths = this.transformPaths(spec.paths);

    return newSpec;
  }
}

module.exports = RefPathParametersTransformer;

function refPathParameters(spec) {
  const transformer = new RefPathParametersTransformer();
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
    .then((specStr) => refPathParameters(JSON.parse(specStr)))
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
