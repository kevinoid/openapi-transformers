/**
 * @copyright Copyright 2019 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 * @module "openapi-transformers/ref-path-parameters.js"
 */

import assert from 'assert';
import OpenApiTransformerBase from 'openapi-transformer-base';

const componentParamsSymbol = Symbol('componentParams');
const paramRefPrefixSymbol = Symbol('paramRefPrefix');

/**
 * Move Parameters defined on Path Item Objects to global parameters which
 * are referenced in the Path Item so that Autorest will treat them as
 * properties of the generated client, rather than method.
 * https://github.com/Azure/autorest/tree/master/docs/extensions#x-ms-parameter-location
 */
export default class RefPathParametersTransformer
  extends OpenApiTransformerBase {
  transformParameter(param) {
    if (!param || param.$ref) {
      return param;
    }

    const gparam = this[componentParamsSymbol][param.name];
    if (gparam) {
      assert.deepStrictEqual(gparam, param);
    } else {
      this[componentParamsSymbol][param.name] = param;
    }

    return { $ref: this[paramRefPrefixSymbol] + param.name };
  }

  transformPathItem(pathItem) {
    if (!pathItem
      || !Array.isArray(pathItem.parameters)
      || pathItem.parameters.length === 0) {
      return pathItem;
    }

    return {
      ...pathItem,
      parameters: pathItem.parameters.map(this.transformParameter, this),
    };
  }

  transformOpenApi(spec) {
    const newSpec = { ...spec };

    if (spec.swagger) {
      newSpec.parameters = { ...newSpec.parameters };
      this[componentParamsSymbol] = newSpec.parameters;
      this[paramRefPrefixSymbol] = '#/parameters/';
    } else {
      newSpec.components = { ...newSpec.components };
      newSpec.components.parameters = { ...newSpec.components.parameters };
      this[componentParamsSymbol] = newSpec.components.parameters;
      this[paramRefPrefixSymbol] = '#/components/parameters/';
    }

    newSpec.paths = this.transformPaths(spec.paths);

    return newSpec;
  }
}
