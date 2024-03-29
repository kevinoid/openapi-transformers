/**
 * @copyright Copyright 2019-2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 * @module "openapi-transformers/escape-enum-values.js"
 */

import OpenApiTransformerBase from 'openapi-transformer-base';

const escapeStringSymbol = Symbol('escapeString');

function makeEscapeString(lang) {
  let charToEscape = {
    '\0': '\\0',
    '\x07': '\\a',
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\v': '\\v',
    '\f': '\\f',
    '\r': '\\r',
    "'": "\\'",
    '"': '\\"',
    '\\': '\\\\',
  };
  // Escape control characters for all languages for readability
  let charRange = '\0-\x1F\x7F';

  let toAstralEscape, toCodeEscape;
  switch (lang) {
    case 'csharp':
      // https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/lexical-structure#string-literals
      charRange += '\n\r"\\\\\x85\u2028\u2029';
      // Note: Although \x can be shorter, must be careful to provide 4
      // digits when next character is hex digit.  Use \u for consistency.
      toCodeEscape =
        (c) => `\\u${c.codePointAt(0).toString(16).padStart(4, '0')}`;
      toAstralEscape = (code) => `\\U${code.toString(16).padStart(8, '0')}`;
      break;

    case 'go':
      // https://golang.org/ref/spec#String_literals
      charRange += '\n"\\\\';
      toCodeEscape = (c) => {
        const code = c.codePointAt(0);
        return code <= 0xFF ? `\\x${code.toString(16).padStart(2, '0')}`
          : `\\u${code.toString(16).padStart(4, '0')}`;
      };
      toAstralEscape = (code) => `\\U${code.toString(16).padStart(8, '0')}`;
      break;

    case 'java':
      // https://docs.oracle.com/javase/specs/jls/se8/html/jls-3.html#jls-3.10.5
      charRange += '\n"\\\\';
      delete charToEscape['\0'];
      delete charToEscape['\x07'];
      delete charToEscape['\v'];
      toCodeEscape =
        (c) => `\\u${c.codePointAt(0).toString(16).padStart(4, '0')}`;
      break;

    case 'nodejs':
    case 'typescript':
      // https://www.ecma-international.org/ecma-262/6.0/#sec-literals-string-literals
      // Note: AutoRest currently produces single-quoted strings, but the
      // bloat from extra quoting is minor compared to risk.
      charRange += '\n"\'\\\\';
      delete charToEscape['\x07'];
      toCodeEscape = (c) => {
        const code = c.codePointAt(0);
        return code <= 0xFF ? `\\x${code.toString(16).padStart(2, '0')}`
          : `\\u${code.toString(16).padStart(4, '0')}`;
      };
      toAstralEscape = (code) => `\\u{${code.toString(16)}}`;
      break;

    case 'php':
      // https://www.php.net/manual/en/language.types.string.php
      // FIXME: Does AutoRest produce single- or double-quoted strings?
      // Can't test due to https://github.com/Azure/autorest/issues/3372
      charRange += '\n"\\\\';
      delete charToEscape['\x07'];
      delete charToEscape['\b'];
      charToEscape['\x1B'] = '\\e';
      toCodeEscape = (c) => {
        const code = c.codePointAt(0);
        return code <= 0xFF ? `\\x${code.toString(16).padStart(2, '0')}`
          : `\\u{${code.toString(16)}}`;
      };
      toAstralEscape = (code) => `\\u{${code.toString(16)}}`;
      break;

    case 'python':
      // https://docs.python.org/3/reference/lexical_analysis.html#string-and-bytes-literals
      // Note: AutoRest currently produces single-quoted strings, but the
      // bloat from extra quoting is minor compared to risk.
      charRange += '\n"\'\\\\';
      toCodeEscape = (c) => {
        const code = c.codePointAt(0);
        return code <= 0xFF ? `\\x${code.toString(16).padStart(2, '0')}`
          : `\\u${code.toString(16).padStart(4, '0')}`;
      };
      toAstralEscape = (code) => `\\U${code.toString(16).padStart(8, '0')}`;
      break;

    case 'ruby':
      // Note: AutoRest currently produces single-quoted strings.
      // Single-quoted strings only accept \' and \\ escapes.
      // https://docs.ruby-lang.org/en/2.4.0/syntax/literals_rdoc.html#label-Strings
      charRange = "'\\\\";
      charToEscape = {
        "'": "\\'",
        '\\': '\\\\',
      };
      toCodeEscape = (c) => c;
      break;

    default:
      throw new RangeError(`Unrecognized language '${lang}'`);
  }

  function replaceAstral(pair) {
    return toAstralEscape(pair.codePointAt(0));
  }
  function replaceChar(c) {
    return charToEscape[c] || toCodeEscape(c);
  }
  const charPattern = new RegExp(`[${charRange}]`, 'g');
  return function escapeString(str) {
    if (!str || typeof str !== 'string') {
      return str;
    }

    const charEscaped = str.replace(charPattern, replaceChar);
    const astralEscaped =
      !toAstralEscape ? charEscaped : charEscaped.replaceAll(
        /[\uD800-\uDBFF][\uDC00-\uDFFF]/g,
        replaceAstral,
      );
    return astralEscaped;
  };
}

function escapeInSchema(schema, escapeString) {
  const xMsEnum = schema['x-ms-enum'];
  if (!xMsEnum || schema.type !== 'string') {
    // Schema won't generate a class/enum with string values
    return schema;
  }

  const xMsEnumValues = xMsEnum.values;
  if (xMsEnumValues) {
    // generator uses .x-ms-enum.values instead of .enum
    return {
      ...schema,
      'x-ms-enum': {
        ...xMsEnum,
        values: xMsEnumValues.map((xMsEnumValue) => ({
          ...xMsEnumValue,
          value: escapeString(xMsEnumValue.value),
        })),
      },
    };
  }

  return {
    ...schema,
    enum: schema.enum.map(escapeString),
  };
}

/**
 * Transformer to escape string enum values appropriately for C# string literals
 * when code will be generated by Autorest, since it currently does not.
 *
 * https://github.com/Azure/autorest/issues/3371
 */
export default class EscapeEnumValuesTransformer
  extends OpenApiTransformerBase {
  constructor({ language }) {
    super();

    const typeofLanguage = typeof language;
    switch (typeofLanguage) {
      case 'string':
        this[escapeStringSymbol] = makeEscapeString(language);
        break;
      case 'function':
        this[escapeStringSymbol] = language;
        break;
      default:
        throw new TypeError(
          `options.language must be a string or function, got ${
            typeofLanguage}`,
        );
    }
  }

  transformSchema(schema) {
    return escapeInSchema(
      super.transformSchema(schema),
      this[escapeStringSymbol],
    );
  }

  transformParameter(parameter) {
    return escapeInSchema(
      super.transformParameter(parameter),
      this[escapeStringSymbol],
    );
  }
}
