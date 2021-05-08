/**
 * Script to add x-ms-enum.values.name to enums where the name generated by
 * Autorest would be hard to read due to lack of capitalization.
 *
 * https://github.com/Azure/autorest/issues/3328
 *
 * @copyright Copyright 2019 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'assert';
import OpenApiTransformerBase from 'openapi-transformer-base';
import microsoftCase from './lib/microsoft-case.js';

assert(/\p{L}/u.test('X'), 'Unicode property escapes are supported.');

function firstToLower(word) {
  if (!word) {
    return word;
  }

  // Lower-case 2-letter acronym together (as Autorest does)
  if (word.length === 2 && word === word.toUpperCase()) {
    return word.toLowerCase();
  }

  return word.charAt(0).toLowerCase() + word.slice(1);
}

function firstToUpper(word) {
  if (!word) {
    return word;
  }

  return word.charAt(0).toUpperCase() + word.slice(1);
}

/** Returns the enum member name which would be used by Autorest.
 * https://github.com/Azure/autorest.common/blob/54c21af/src/CodeNamer.cs#L178
 *
 * @private
 */
function autorestEnumMemberName(value) {
  const clean = value.replace(/[^\p{L}\p{N}_-]/gu, '');
  const words = clean.split(/[_-]/);

  if (clean.charAt(0) === '_') {
    // eslint-disable-next-line prefer-template
    return '_' + words
      .map((word, i) => (i > 0 ? firstToUpper(word) : firstToLower(word)))
      .join('');
  }

  return words
    .map(firstToUpper)
    .join('');
}

function addXMsEnumValueNamesToSchema(schema, schemaName, options) {
  if (!schema.enum || !schema['x-ms-enum']) {
    // Schema won't generate an enum
    return schema;
  }

  const xMsEnum = schema['x-ms-enum'];
  const xMsEnumValues = xMsEnum.values;
  if (xMsEnumValues
    && xMsEnumValues.every((v) => v.name !== null && v.name !== undefined)) {
    // Names already specified for all values
    return schema;
  }

  const values =
    Array.isArray(xMsEnumValues) ? xMsEnumValues.map((v) => v.value)
      : schema.enum;
  const stringValues = values.map(String);
  const autorestNames = stringValues.map(autorestEnumMemberName);
  const microsoftNames = stringValues.map(microsoftCase);

  let anyNameChanged = false;
  let newXMsEnumValues;
  if (Array.isArray(xMsEnumValues)) {
    newXMsEnumValues = xMsEnumValues.map((xMsEnumValue, i) => {
      if (xMsEnumValue.name !== null && xMsEnumValue.name !== undefined) {
        return xMsEnumValue;
      }

      const autorestName = autorestNames[i];
      const microsoftName = microsoftNames[i];
      if (autorestName === microsoftName) {
        return xMsEnumValue;
      }

      anyNameChanged = true;
      return {
        ...xMsEnumValue,
        name: microsoftName,
      };
    });
  } else {
    newXMsEnumValues = schema.enum.map((value, i) => {
      const autorestName = autorestNames[i];
      const microsoftName = microsoftNames[i];
      const newXMsEnumValue = { value };
      if (autorestName !== microsoftName) {
        anyNameChanged = true;
        newXMsEnumValue.name = microsoftName;
      }
      return newXMsEnumValue;
    });
  }

  if (!anyNameChanged) {
    return schema;
  }

  return {
    ...schema,
    'x-ms-enum': {
      ...xMsEnum,
      values: newXMsEnumValues,
    },
  };
}

// eslint-disable-next-line import/no-unused-modules
export default class AddXMsEnumValueNamesTransformer
  extends OpenApiTransformerBase {
  constructor(options) {
    super();
    this.options = options;
  }

  transformSchema(schema) {
    return addXMsEnumValueNamesToSchema(
      super.transformSchema(schema),
      this.options,
    );
  }

  transformParameter(parameter) {
    return addXMsEnumValueNamesToSchema(
      super.transformParameter(parameter),
      this.options,
    );
  }
}
