/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

/* eslint-disable max-classes-per-file */

import { format, isDeepStrictEqual } from 'util';

/** Map from JSON Schema validation keyword to function which intersects
 * keyword values, or false if the keyword should be ignored.
 *
 * @private
 * @type {!Object<string,boolean|function(*,*)>}
 */
const intersectKeywordByName = Object.create(null);

/** Do two JSON Schemas have the same semantics (i.e. validate the same set of
 * values)?
 *
 * TODO: Ignore properties which don't affect valid instances (e.g.
 * description, example, examples, externalDocs, title, $comment)
 *
 * @private
 */
const isSchemaEqual = isDeepStrictEqual;

/** An error indicating that the intersection of given keyword values is
 * empty.
 */
export class EmptyIntersectionError extends RangeError {
  constructor(keyword, value1, value2) {
    super(
      format(
        'Intersection of %s %O and %O is empty',
        keyword,
        value1,
        value2,
      ),
    );
    this.keyword = keyword;
    this.value1 = value1;
    this.value2 = value2;
  }
}
EmptyIntersectionError.prototype.name = 'EmptyIntersectionError';

/** An error indicating that the intersection of given keyword values is
 * not currently supported.
 */
export class IntersectNotSupportedError extends RangeError {
  constructor(keyword, value1, value2, message) {
    super(
      format(
        'Unable to intersect %s %O and %O',
        keyword,
        value1,
        value2,
      )
      + (message ? `: ${message}` : ''),
    );
    this.keyword = keyword;
    this.value1 = value1;
    this.value2 = value2;
  }
}
IntersectNotSupportedError.prototype.name = 'IntersectNotSupportedError';

function intersectAllOf(allOf1, allOf2) {
  if (!Array.isArray(allOf1)) {
    throw new TypeError('allOf1 must be an Array');
  }
  if (!Array.isArray(allOf2)) {
    throw new TypeError('allOf2 must be an Array');
  }

  const allOf = [...allOf1];
  for (const elem2 of allOf2) {
    if (!allOf1.some((elem1) => isSchemaEqual(elem1, elem2))) {
      allOf.push(elem2);
    }
  }

  return allOf;
}

function intersectAnyOf(anyOf1, anyOf2) {
  if (!Array.isArray(anyOf1)) {
    throw new TypeError('anyOf1 must be an Array');
  }
  if (!Array.isArray(anyOf2)) {
    throw new TypeError('anyOf2 must be an Array');
  }

  if (anyOf1.length <= anyOf2.length
    && anyOf1.every((a1) => anyOf2.some((a2) => isSchemaEqual(a1, a2)))) {
    // anyOf1 is a subset of anyOf2, so an instance validates successfully
    // against both anyOf1 and anyOf2 if and only if it validates successfully
    // against anyOf1.
    return anyOf1;
  }

  if (anyOf2.length < anyOf1.length
    && anyOf2.every((a2) => anyOf1.some((a1) => isSchemaEqual(a1, a2)))) {
    // anyOf2 is a subset of anyOf1, so an instance validates successfully
    // against both anyOf1 and anyOf2 if and only if it validates successfully
    // against anyOf2.
    return anyOf2;
  }

  if (anyOf1.length === 1) {
    const a1 = anyOf1[0];
    // eslint-disable-next-line no-use-before-define
    return anyOf2.map((a2) => intersectSchema(a2, a1));
  }

  if (anyOf2.length === 1) {
    const a2 = anyOf2[0];
    // eslint-disable-next-line no-use-before-define
    return anyOf1.map((a1) => intersectSchema(a1, a2));
  }

  throw new IntersectNotSupportedError('anyOf', anyOf1, anyOf2);
}

function intersectEnum(enum1, enum2) {
  if (!Array.isArray(enum1)) {
    throw new TypeError('enum1 must be an Array');
  }
  if (!Array.isArray(enum2)) {
    throw new TypeError('enum2 must be an Array');
  }

  // TODO: Support array and object values in enum.
  if (enum1.some((e) => e && typeof e === 'object')
    || enum2.some((e) => e && typeof e === 'object')) {
    throw new IntersectNotSupportedError(
      'enum',
      enum1,
      enum2,
      'Array/Object enum values are not supported',
    );
  }

  const set2 = new Set(enum2);
  const intersection = enum1.filter((e) => set2.has(e));
  if (intersection.length === 0) {
    throw new EmptyIntersectionError('enum', enum1, enum2);
  }

  return intersection;
}

function intersectConst(value1, value2) {
  throw new EmptyIntersectionError('const', value1, value2);
}

function intersectDescription(description1, description2) {
  const d1 = description1.includes(' ') ? `(${description1})` : description1;
  const d2 = description2.includes(' ') ? `(${description2})` : description2;
  return `Intersection of ${d1} and ${d2}`;
}

// FIXME: Technically this is incorrect, since the examples from schema1 may
// not satisfy schema2 and vice versa.
function intersectExamples(examples1, examples2) {
  if (!Array.isArray(examples1)) {
    throw new TypeError('examples1 must be an Array');
  }
  if (!Array.isArray(examples2)) {
    throw new TypeError('examples2 must be an Array');
  }

  const examples = [...examples1];
  for (const elem2 of examples2) {
    if (!examples1.some((elem1) => isSchemaEqual(elem1, elem2))) {
      examples.push(elem2);
    }
  }

  return examples;
}

function intersectMax(max1, max2) {
  if (typeof max1 !== 'number') {
    throw new TypeError('max1 must be a number');
  }
  if (typeof max2 !== 'number') {
    throw new TypeError('max2 must be a number');
  }

  return max1 < max2 ? max1 : max2;
}

function intersectMin(min1, min2) {
  if (typeof min1 !== 'number') {
    throw new TypeError('min1 must be a number');
  }
  if (typeof min2 !== 'number') {
    throw new TypeError('min2 must be a number');
  }

  return min1 < min2 ? min2 : min1;
}

function intersectMultipleOf(multipleOf1, multipleOf2) {
  if (typeof multipleOf1 !== 'number' || !(multipleOf1 > 0)) {
    throw new TypeError('multipleOf1 must be a positive number');
  }
  if (typeof multipleOf2 !== 'number' || !(multipleOf2 > 0)) {
    throw new TypeError('multipleOf2 must be a positive number');
  }

  if (multipleOf1 % multipleOf2 === 0) {
    return multipleOf1;
  }

  if (multipleOf2 % multipleOf1 === 0) {
    return multipleOf2;
  }

  return multipleOf1 * multipleOf2;
}

function intersectOneOf(oneOf1, oneOf2) {
  if (!Array.isArray(oneOf1)) {
    throw new TypeError('oneOf1 must be an Array');
  }
  if (!Array.isArray(oneOf2)) {
    throw new TypeError('oneOf2 must be an Array');
  }

  if (oneOf1.length === oneOf2.length
    && oneOf1.every((o1) => oneOf2.some((o2) => isSchemaEqual(o1, o2)))) {
    // oneOf1 and oneOf2 are permuted.  Order doesn't matter for validation.
    return oneOf1;
  }

  if (oneOf1.length === 1) {
    const o1 = oneOf1[0];
    // eslint-disable-next-line no-use-before-define
    return oneOf2.map((o2) => intersectSchema(o2, o1));
  }

  if (oneOf2.length === 1) {
    const o2 = oneOf2[0];
    // eslint-disable-next-line no-use-before-define
    return oneOf1.map((o1) => intersectSchema(o1, o2));
  }

  throw new IntersectNotSupportedError('oneOf', oneOf1, oneOf2);
}

function intersectPattern(pattern1, pattern2) {
  if (typeof pattern1 !== 'string') {
    throw new TypeError('pattern1 must be a string');
  }
  if (typeof pattern2 !== 'string') {
    throw new TypeError('pattern2 must be a string');
  }

  // A pattern which matches both pattern1 and pattern2 using lookahead
  // assertions.
  // Note: The patterns are not implicitly anchored.
  // https://json-schema.org/draft/2020-12/json-schema-validation.html#pattern
  // If they don't start with '^', add '.*' to each.
  const assert1 = pattern1[0] === '^' ? pattern1 : `.*${pattern1}`;
  const assert2 = pattern2[0] === '^' ? pattern2 : `.*${pattern2}`;

  // Note: Add ^ to ensure assertions are only tested once when matching
  return `^(?=${assert1})(?=${assert2})`;
}

function intersectRequired(required1, required2) {
  if (!Array.isArray(required1)) {
    throw new TypeError('required1 must be an Array');
  }
  if (!Array.isArray(required2)) {
    throw new TypeError('required2 must be an Array');
  }

  return [
    ...required1,
    ...required2.filter((r2) => !required1.includes(r2)),
  ];
}

function intersectDependentRequired(dependentRequired1, dependentRequired2) {
  if (!dependentRequired1 || typeof dependentRequired1 !== 'object') {
    throw new TypeError('dependentRequired1 must be an object');
  }
  if (!dependentRequired2 || typeof dependentRequired2 !== 'object') {
    throw new TypeError('dependentRequired2 must be an object');
  }

  const dependentRequired = { ...dependentRequired1 };
  for (const [propertyName, required2] of Object.entries(dependentRequired2)) {
    if (required2 !== undefined) {
      if (!Array.isArray(required2)) {
        throw new TypeError('values of dependentRequired2 must be Array');
      }

      const required1 = hasOwnProperty.call(dependentRequired1, propertyName)
        ? dependentRequired1[propertyName]
        : undefined;
      if (required1 !== undefined && !Array.isArray(required1)) {
        throw new TypeError('values of dependentRequired1 must be Array');
      }

      if (required1 === undefined || required1.length === 0) {
        dependentRequired[propertyName] = required2;
      } else if (!isDeepStrictEqual(required1, required2)) {
        dependentRequired[propertyName] =
          intersectRequired(required1, required2);
      }
    }
  }

  return dependentRequired;
}

function intersectType(type1, type2) {
  if (type1 === type2 || type2 === undefined) {
    return type1;
  }
  if (type1 === undefined) {
    return type2;
  }

  const arr1 = Array.isArray(type1) ? type1 : [type1];
  const set2 = Array.isArray(type2) ? new Set(type2) : new Set([type2]);

  const intersection = [];
  for (const elem1 of arr1) {
    if (set2.has(elem1)) {
      intersection.push(elem1);
    } else if (elem1 === 'integer' && set2.has('number')) {
      intersection.push(elem1);
    } else if (elem1 === 'number' && set2.has('integer')) {
      intersection.push('integer');
    }
  }

  if (intersection.length === 0) {
    throw new EmptyIntersectionError('type', type1, type2);
  }

  return intersection.length === 1 ? intersection[0] : intersection;
}

function intersectBoolean(value1, value2) {
  if (typeof value1 !== 'boolean') {
    throw new TypeError('value1 must be boolean');
  }
  if (typeof value2 !== 'boolean') {
    throw new TypeError('value2 must be boolean');
  }

  return value1 || value2;
}

function mergeProperties(
  propertiesIntersected,
  properties1,
  properties2,
  patternProperties2,
  additionalProperties2,
) {
  // Note: patterns in patternProperties are not anchored:
  // https://github.com/json-schema-org/json-schema-spec/issues/897
  const regexProperties2 = !patternProperties2 ? []
    : Object.entries(patternProperties2).map(([k, v]) => [new RegExp(k), v]);

  for (const [propertyName, property1] of Object.entries(properties1)) {
    if (property1 === undefined) {
      // Treat undefined like absent properties.  Ignore.
      continue;
    }

    if (hasOwnProperty.call(propertiesIntersected, propertyName)) {
      // Property has already been handled
      continue;
    }

    if (properties2) {
      const property2 = properties2[propertyName];
      if (property2 !== undefined
        && hasOwnProperty.call(properties2, propertyName)) {
        // Named property in schema1 and schema2.  Intersect.
        propertiesIntersected[propertyName] =
          // eslint-disable-next-line no-use-before-define
          intersectSchema(property1, property2);
        continue;
      }
    }

    const matchProps2 = regexProperties2
      .filter((rp) => rp[0].test(propertyName));
    if (matchProps2.length > 0) {
      // Named property in schema1 matches patternProperties in schema2.
      // Intersect property1 with all matching patternProperties schemas.
      propertiesIntersected[propertyName] = matchProps2
        .map((rp) => rp[1])
        // eslint-disable-next-line no-use-before-define
        .reduce(intersectSchema, property1);
      continue;
    }

    if (additionalProperties2 !== undefined) {
      // Named property in schema1 matches additionalProperties in schema2.
      propertiesIntersected[propertyName] =
        // eslint-disable-next-line no-use-before-define
        intersectSchema(property1, additionalProperties2);
      continue;
    }

    // Named property in schema1 doesn't match anything in schema2
    propertiesIntersected[propertyName] = property1;
  }
}

function intersectSchemaProperties(schemaIntersected, schema1, schema2) {
  const {
    properties: properties1,
    patternProperties: patternProperties1,
    additionalProperties: additionalProperties1,
  } = schema1;
  const {
    properties: properties2,
    patternProperties: patternProperties2,
    additionalProperties: additionalProperties2,
  } = schema2;

  if (properties1 !== undefined
    && (properties1 === null || typeof properties1 !== 'object')) {
    throw new TypeError('properties must be an object');
  }

  if (properties2 !== undefined
    && (properties2 === null || typeof properties2 !== 'object')) {
    throw new TypeError('properties must be an object');
  }

  if (patternProperties1 !== undefined
    && (patternProperties1 === null
      || typeof patternProperties1 !== 'object')) {
    throw new TypeError('patternProperties must be an object');
  }

  if (patternProperties2 !== undefined
    && (patternProperties2 === null
      || typeof patternProperties2 !== 'object')) {
    throw new TypeError('patternProperties must be an object');
  }

  if (additionalProperties1 !== undefined
    && typeof additionalProperties1 !== 'boolean'
    && (additionalProperties1 === null
      || typeof additionalProperties1 !== 'object')) {
    throw new TypeError('additionalProperties must be an object or boolean');
  }

  if (additionalProperties2 !== undefined
    && typeof additionalProperties2 !== 'boolean'
    && (additionalProperties2 === null
      || typeof additionalProperties2 !== 'object')) {
    throw new TypeError('additionalProperties must be an object or boolean');
  }

  const properties = {};
  if (properties1 !== undefined) {
    mergeProperties(
      properties,
      properties1,
      properties2,
      patternProperties2,
      additionalProperties2,
    );
  }
  if (properties2 !== undefined) {
    mergeProperties(
      properties,
      properties2,
      properties1,
      patternProperties1,
      additionalProperties1,
    );
  }
  if (Object.keys(properties).length > 0) {
    schemaIntersected.properties = properties;
  } else {
    delete schemaIntersected.properties;
  }

  const patternProperties = {};
  if (patternProperties1 !== undefined) {
    mergeProperties(
      patternProperties,
      patternProperties1,
      patternProperties2,
      undefined,
      additionalProperties2,
    );
  }
  if (patternProperties2 !== undefined) {
    mergeProperties(
      patternProperties,
      patternProperties2,
      patternProperties1,
      undefined,
      additionalProperties1,
    );
  }
  if (Object.keys(patternProperties).length > 0) {
    schemaIntersected.patternProperties = patternProperties;
  } else {
    delete schemaIntersected.patternProperties;
  }
}

function normalizeSchema(schema) {
  // Note: exclusiveMinimum/exclusiveMaximum were boolean in JSON Schema Draft
  // 04 (referenced by OpenAPI 2) and earlier.  Number in Draft 06 and later
  // (referenced by OpenAPI 3).  See:
  // https://json-schema.org/draft-06/json-schema-release-notes.html#backwards-incompatible-changes
  // Convert to number for intersection.
  if (typeof schema.exclusiveMinimum === 'boolean'
    || typeof schema.exclusiveMaximum === 'boolean') {
    schema = { ...schema };

    if (schema.exclusiveMinimum === true) {
      schema.exclusiveMinimum = schema.minimum;
      delete schema.minimum;
    } else if (schema.exclusiveMinimum === false) {
      delete schema.exclusiveMinimum;
    }

    if (schema.exclusiveMaximum === true) {
      schema.exclusiveMaximum = schema.maximum;
      delete schema.maximum;
    } else if (schema.exclusiveMaximum === false) {
      delete schema.exclusiveMaximum;
    }
  }

  return schema;
}

/** Creates a JSON Schema which describes values that satisfy the constraints
 * of the two given JSON Schemas (i.e. the intersection of the sets of values
 * that satisfy each given JSON Schema).
 *
 * This function creates a schema with the intersection of individual
 * constraints from each schema.  This can be useful in some situations (e.g.
 * OAS3 to OAS2 conversion).  In situations where sub-schemas are permitted,
 * simply using the schema {allOf:[schema1,schema2]} is likely to be preferable.
 *
 * @param {!object|boolean} schema1 A JSON Schema.
 * @param {!object|boolean} schema2 A JSON Schema.
 * @returns {!object|boolean} A JSON Schema which describes values matching
 * both schema1 and schema2.
 * @throws {TypeError} If schema1 or schema2 is not a JSON Schema.
 * @throws {EmptyIntersectionError} If schema1 and schema2 have at least one
 * constraint with values which are mutually exclusive.  Note: This is not
 * thrown for constraints which are unsatisfiable in combination (e.g.
 * minimum+maximum) or a constraint is unsatisfiable on its own (e.g.
 * {not:{}}) or constraints where mutual exclusivity is representable (e.g.
 * {allOf:[{type:number},{type:boolean}]}).
 * @throws {IntersectNotSupportedError} If schema1 or schema2 contain a
 * keyword value for which intersection has not been implemented.
 */
export default function intersectSchema(schema1, schema2) {
  const typeof1 = typeof schema1;
  if (schema1 === null || (typeof1 !== 'object' && typeof1 !== 'boolean')) {
    throw new TypeError('schema1 must be an object or boolean');
  }

  const typeof2 = typeof schema2;
  if (schema2 === null || (typeof2 !== 'object' && typeof2 !== 'boolean')) {
    throw new TypeError('schema2 must be an object or boolean');
  }

  // Note: JSON Schema 2020-12 (i.e. draft-bhutton-json-schema-00),
  // referenced by OpenAPI 3.1, defines true and false as valid schemas
  // with true equivalent to {} and false equivalent to {not:{}}
  // https://json-schema.org/draft/2020-12/json-schema-core.html#rfc.section.4.3.2
  if (schema1 === false || schema2 === false) {
    return false;
  }

  // Note: true behaves like {} for { ... } and Object.entries().
  // No special handling required.
  // Return true if both are true for consistency.
  if (schema1 === true && schema2 === true) {
    return true;
  }

  // Optimization: If schemas are equal, skip intersecting each keyword.
  if (isSchemaEqual(schema1, schema2)) {
    return schema1;
  }

  const boolExclusiveMax =
    typeof schema1.exclusiveMaximum === 'boolean'
    || typeof schema2.exclusiveMaximum === 'boolean';
  const boolExclusiveMin =
    typeof schema1.exclusiveMinimum === 'boolean'
    || typeof schema2.exclusiveMinimum === 'boolean';

  schema1 = normalizeSchema(schema1);
  schema2 = normalizeSchema(schema2);

  const intersection = { ...schema1 };
  intersectSchemaProperties(intersection, schema1, schema2);

  for (const [keyword, value2] of Object.entries(schema2)) {
    if (value2 !== undefined) {
      const value1 = intersection[keyword];
      if (value1 === undefined) {
        intersection[keyword] = value2;
      } else if (!isDeepStrictEqual(value1, value2)) {
        const intersectKeyword = intersectKeywordByName[keyword];
        if (intersectKeyword) {
          intersection[keyword] = intersectKeyword(value1, value2);
        } else if (intersectKeyword === undefined) {
          throw new IntersectNotSupportedError(keyword, value1, value2);
        }
      }
    }
  }

  if (schema1.deprecated && schema2.deprecated) {
    intersection.deprecated = true;
  } else {
    delete intersection.deprecated;
  }

  // Clean up maximum/exclusiveMaximum
  if (intersection.exclusiveMaximum <= intersection.maximum
    || (intersection.maximum === undefined
      && intersection.exclusiveMaximum !== undefined)) {
    if (boolExclusiveMax) {
      intersection.maximum = intersection.exclusiveMaximum;
      intersection.exclusiveMaximum = true;
    } else {
      delete intersection.maximum;
    }
  } else {
    delete intersection.exclusiveMaximum;
  }

  // Clean up minimum/exclusiveMinimum
  if (intersection.exclusiveMinimum >= intersection.minimum
    || (intersection.minimum === undefined
      && intersection.exclusiveMinimum !== undefined)) {
    if (boolExclusiveMin) {
      intersection.minimum = intersection.exclusiveMinimum;
      intersection.exclusiveMinimum = true;
    } else {
      delete intersection.minimum;
    }
  } else {
    delete intersection.exclusiveMinimum;
  }

  return intersection;
}

intersectKeywordByName.additionalProperties = intersectSchema;
intersectKeywordByName.allOf = intersectAllOf;
intersectKeywordByName.anyOf = intersectAnyOf;
intersectKeywordByName.const = intersectConst;
intersectKeywordByName.dependentRequired = intersectDependentRequired;
intersectKeywordByName.deprecated = false;
intersectKeywordByName.description = intersectDescription;
intersectKeywordByName.enum = intersectEnum;
intersectKeywordByName.example = false;
intersectKeywordByName.examples = intersectExamples;
intersectKeywordByName.exclusiveMaximum = intersectMax;
intersectKeywordByName.exclusiveMinimum = intersectMin;
intersectKeywordByName.maxItems = intersectMax;
intersectKeywordByName.maxLength = intersectMax;
intersectKeywordByName.maximum = intersectMax;
intersectKeywordByName.maxProperties = intersectMax;
intersectKeywordByName.minItems = intersectMin;
intersectKeywordByName.minLength = intersectMin;
intersectKeywordByName.minimum = intersectMin;
intersectKeywordByName.minProperties = intersectMin;
intersectKeywordByName.multipleOf = intersectMultipleOf;
intersectKeywordByName.oneOf = intersectOneOf;
intersectKeywordByName.pattern = intersectPattern;
intersectKeywordByName.patternProperties = false;
intersectKeywordByName.properties = false;
intersectKeywordByName.propertyNames = intersectSchema;
intersectKeywordByName.readOnly = intersectBoolean;
intersectKeywordByName.required = intersectRequired;
intersectKeywordByName.title = intersectDescription;
intersectKeywordByName.type = intersectType;
intersectKeywordByName.uniqueItems = intersectBoolean;
intersectKeywordByName.writeOnly = intersectBoolean;
