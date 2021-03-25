#!/usr/bin/env node
/**
 * Script to change request parameter types to string for operations which
 * only consume application/x-www-form-urlencoded, to work around
 * https://github.com/Azure/autorest/issues/3449
 *
 * @copyright Copyright 2020 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

'use strict';

const OpenApiTransformerBase = require('openapi-transformer-base');
const { readFile, writeFile } = require('./lib/file-utils.js');

function isFormData(mediaType) {
  return /^multipart\/form-data\s*(;.*)?$/i.test(mediaType);
}

function isUrlencoded(mediaType) {
  return /^application\/x-www-form-urlencoded\s*(;.*)?$/i.test(mediaType);
}

class UrlencodedToStringTransformer extends OpenApiTransformerBase {
  transformSchema(schema) {
    if (typeof schema !== 'object' || schema === null) {
      return schema;
    }

    let newSchema = super.transformSchema(schema);

    // Change primitive types to string
    if (['number', 'integer', 'boolean'].includes(schema.type)) {
      newSchema = {
        ...newSchema,
        type: 'string',
      };
    }

    // Ensure enums are modeled as string
    const { type, 'x-ms-enum': xMsEnum } = newSchema;
    if (type === 'string'
      && xMsEnum
      && xMsEnum.modelAsString !== true) {
      newSchema = { ...newSchema };
      // Note: Could set modelAsString: true, but would cause conflict if any
      // other params/schemas have same name
      delete newSchema['x-ms-enum'];
    }

    return newSchema;
  }

  transformParameter(parameter) {
    if (!parameter || parameter.in !== 'formData') {
      return parameter;
    }

    return this.transformSchema(parameter);
  }

  transformRequestBody(requestBody) {
    if (!requestBody || !requestBody.content) {
      return requestBody;
    }

    const { content } = requestBody;
    const consumes = Object.keys(content);
    const urlencoded = consumes.find(isUrlencoded);
    if (!urlencoded) {
      return requestBody;
    }

    return {
      ...requestBody,
      content: {
        ...content,
        [urlencoded]: this.transformMediaType(content[urlencoded]),
      },
    };
  }

  transformOperation(operation) {
    if (!operation) {
      return super.transformOperation(operation);
    }

    const { consumes, parameters, requestBody } = operation;
    if (requestBody === undefined && !Array.isArray(parameters)) {
      return operation;
    }

    const newOperation = { ...operation };

    if (parameters !== undefined
      && Array.isArray(consumes)
      && consumes.some(isUrlencoded)
      && !consumes.some(isFormData)) {
      newOperation.parameters = parameters.map(this.transformParameter, this);
    }

    if (requestBody !== undefined) {
      newOperation.requestBody =
        this.transformRequestBody(newOperation.requestBody);
    }

    return newOperation;
  }

  transformOpenApi(openApi) {
    return {
      ...openApi,
      paths: this.transformPaths(openApi.paths),
    };
  }
}

module.exports = UrlencodedToStringTransformer;

function urlencodedToString(spec) {
  const transformer = new UrlencodedToStringTransformer();
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
    .then((specStr) => urlencodedToString(JSON.parse(specStr)))
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
