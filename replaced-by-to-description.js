/**
 * Convert x-deprecated.replaced-by to x-deprecated.description, if not present.
 * https://github.com/Azure/autorest/tree/master/Samples/test/deprecated
 *
 * Since Autorest C# doesn't use replaced-by, but does use description.
 *
 * @copyright Copyright 2019 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import OpenApiTransformerBase from 'openapi-transformer-base';

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

// eslint-disable-next-line import/no-unused-modules
export default class ReplacedByToDescriptionTransformer
  extends OpenApiTransformerBase {
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
