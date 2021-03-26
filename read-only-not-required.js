#!/usr/bin/env node
/**
 * Script to ensure readOnly schema properties are not required, to work around
 * lack of support in generators.
 *
 * The behavior of required readOnly/writeOnly properties is defined in OAS3
 * (the requirement only applies on response/request), but not in OAS2 (where
 * writeOnly is not defined and "Properties marked as readOnly being true
 * SHOULD NOT be in the required list").
 *
 * AutoRest Behavior:
 * - required properties must be specified in the constructor.
 * - required properties are non-nullable (unless x-nullable: true).
 * - non-required properties are nullable (unless x-nullable: false).
 * - validation is applied to non-null values in requests, not responses.
 *
 * @copyright Copyright 2019 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

'use strict';

const OpenApiTransformerBase = require('openapi-transformer-base');
const { readFile, writeFile } = require('./lib/file-utils.js');

class ReadOnlyNotRequiredTransformer extends OpenApiTransformerBase {
  constructor(options = {}) {
    super();

    if (!options || typeof options !== 'object') {
      throw new TypeError('options must be an object');
    }

    this.options = options;
  }

  transformSchema(schema) {
    const newSchema = super.transformSchema(schema);
    const { properties, required } = newSchema;
    if (!properties || !Array.isArray(required) || required.length === 0) {
      // No properties are defined or none are required
      return newSchema;
    }

    const readOnlyNames = Object.keys(properties)
      .filter((propName) => properties[propName].readOnly);
    if (readOnlyNames.length === 0) {
      // No readOnly properties
      return newSchema;
    }

    const newRequired = required
      .filter((propName) => !readOnlyNames.includes(propName));
    if (newRequired.length === required.length) {
      // No readOnly properties are required
      return newSchema;
    }

    let newProperties = properties;
    if (this.options.removeValidation || this.options.setNonNullable) {
      newProperties = { ...properties };
      const readOnlyRequired = required
        .filter((propName) => readOnlyNames.includes(propName));
      for (const readOnlyName of readOnlyRequired) {
        const newProperty = { ...properties[readOnlyName] };

        if (this.options.removeValidation) {
          // FIXME: Should handle $ref, which is complicated
          delete newProperty.exclusiveMaximum;
          delete newProperty.exclusiveMinimum;
          delete newProperty.maxItems;
          delete newProperty.maxLength;
          delete newProperty.maximum;
          delete newProperty.minItems;
          delete newProperty.minLength;
          delete newProperty.minimum;
          delete newProperty.multipleOf;
          delete newProperty.pattern;
        }

        if (this.options.setNonNullable
          && !hasOwnProperty.call(newProperty, 'x-nullable')) {
          // Note: x-nullable: false is ignored for enum and class types
          // FIXME: Adding x-nullable to $ref works in AutoRest (if $ref is to
          // non-nullable type other than enum) but violates spec.
          newProperty['x-nullable'] = false;
        }

        newProperties[readOnlyName] = newProperty;
      }
    }

    const updatedSchema = {
      ...newSchema,
      properties: newProperties,
      required: newRequired,
    };
    if (newRequired.length === 0) {
      delete updatedSchema.required;
    }
    return updatedSchema;
  }
}

module.exports = ReadOnlyNotRequiredTransformer;

function readOnlyNotRequired(spec, options) {
  const transformer = new ReadOnlyNotRequiredTransformer(options);
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
    .then((specStr) => readOnlyNotRequired(
      JSON.parse(specStr),
      {
        ...options,
        removeValidation: true,
        setNonNullable: true,
      },
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
