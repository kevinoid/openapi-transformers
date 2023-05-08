/**
 * @copyright Copyright 2019 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

/** Converts a value to the Microsoft Capitalization Conventions.
 * https://docs.microsoft.com/en-us/dotnet/standard/design-guidelines/capitalization-conventions
 *
 * @param {string} value String value to convert.
 * @returns {string} value converted to PascalCase.
 */
export default function microsoftCase(value) {
  if (!value) {
    return value;
  }

  // Separate each word by a space, like no-case, but don't lower-case (yet)
  // https://github.com/blakeembrey/no-case/blob/v2.3.2/no-case.js#L30
  return value
    // Don't treat apostrophe as a word break (unlike no-case)
    .replaceAll('\'', '')
    // Split camelCase words
    .replaceAll(/(\p{Ll})(\p{Lu})/gu, '$1 $2')
    // Split CAMELCase words
    .replaceAll(/(\p{Lu})(\p{Lu}\p{Ll})/gu, '$1 $2')
    // Capitalize words as desired
    .replaceAll(/([\p{L}\p{N}])([\p{L}\p{N}]*)/gu, (word, first, rest) => {
      // Microsoft Capitalization Conventions special case 2-letter acronyms
      // https://docs.microsoft.com/en-us/dotnet/standard/design-guidelines/capitalization-conventions#capitalization-rules-for-identifiers
      if (word.length === 2 && word === word.toUpperCase()) {
        return word;
      }

      // If the word is a roman numeral, leave it capitalized
      // https://stackoverflow.com/a/267405
      if (/^M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/.test(
        word,
      )) {
        return word;
      }

      return first.toUpperCase() + rest.toLowerCase();
    })
    // Remove non-alnum characters
    .replaceAll(/[^\p{L}\p{N}]+/gu, '');
}
