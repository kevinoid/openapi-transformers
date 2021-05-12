/**
 * @copyright Copyright 2019 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 * @module "openapi-transformers/ref-path-parameters.js"
 */

import assert from 'assert';
import OpenApiTransformerBase from 'openapi-transformer-base';

/**
 * Move Parameters defined on Path Item Objects to global parameters which
 * are referenced in the Path Item so that Autorest will treat them as
 * properties of the generated client, rather than method.
 * https://github.com/Azure/autorest/tree/master/docs/extensions#x-ms-parameter-location
 */
export default class RefPathParametersTransformer
  extends OpenApiTransformerBase {
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
