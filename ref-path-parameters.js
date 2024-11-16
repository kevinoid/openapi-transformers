/**
 * @copyright Copyright 2019 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 * @module "openapi-transformers/ref-path-parameters.js"
 */

// Note: Undocumented function which is part of the public API:
// https://github.com/flitbit/json-ptr/issues/29
import { encodeUriFragmentIdentifier } from 'json-ptr';
import OpenApiTransformerBase from 'openapi-transformer-base';

import MatchingParameterManager from './lib/matching-parameter-manager.js';

const parameterManagerSymbol = Symbol('parameterManager');
const parametersPathSymbol = Symbol('parametersPath');

/**
 * Transformer to move Parameters defined on Path Item Objects to global
 * parameters which are referenced in the Path Item so that Autorest will
 * treat them as properties of the generated client, rather than method.
 * https://github.com/Azure/autorest/tree/master/docs/extensions#x-ms-parameter-location
 */
export default class RefPathParametersTransformer
  extends OpenApiTransformerBase {
  transformParameter(param) {
    if (!param || param.$ref) {
      return param;
    }

    const defName =
      this[parameterManagerSymbol].add(param, param.name);
    return {
      $ref: encodeUriFragmentIdentifier([
        ...this[parametersPathSymbol],
        defName,
      ]),
    };
  }

  transformPathItem(pathItem) {
    if (!pathItem
      || !Array.isArray(pathItem.parameters)
      || pathItem.parameters.length === 0) {
      return pathItem;
    }

    return {
      ...pathItem,
      parameters: pathItem.parameters.map(this.transformParameter.bind(this)),
    };
  }

  transformOpenApi(spec) {
    const newSpec = { ...spec };

    if (spec.swagger) {
      newSpec.parameters = { ...newSpec.parameters };
      this[parameterManagerSymbol] =
        new MatchingParameterManager(newSpec.parameters);
      this[parametersPathSymbol] = ['parameters'];
    } else {
      newSpec.components = { ...newSpec.components };
      newSpec.components.parameters = { ...newSpec.components.parameters };
      this[parameterManagerSymbol] =
        new MatchingParameterManager(newSpec.components.parameters);
      this[parametersPathSymbol] = ['components', 'parameters'];
    }

    newSpec.paths = this.transformPaths(spec.paths);

    return newSpec;
  }
}
