/**
 * Script to prefix operationId with the first tag name and an underscore,
 * which Autorest recognizes as an "operation group" represented by a separate
 * API class when generating the client.
 *
 * See https://github.com/Azure/autorest/issues/1497#issuecomment-252082163
 *
 * @copyright Copyright 2019 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import OpenApiTransformerBase from 'openapi-transformer-base';

// eslint-disable-next-line import/no-unused-modules
export default class AddTagToOperationIdsTransformer
  extends OpenApiTransformerBase {
  constructor({ tagSuffix = '' } = {}) {
    super();
    this.tagSuffix = String(tagSuffix);
  }

  transformOperation(op) {
    if (op === null || typeof op !== 'object') {
      return op;
    }

    const { tags } = op;
    if (!Array.isArray(tags) || tags.length === 0) {
      return op;
    }

    const { operationId } = op;
    if (operationId === undefined
      || operationId === null
      || operationId === '') {
      return op;
    }

    return {
      ...op,
      operationId: `${tags[0]}${this.tagSuffix}_${operationId}`,
    };
  }

  // Override as performance optimization, since only transforming paths
  transformOpenApi(spec) {
    return {
      ...spec,
      paths: this.transformPaths(spec.paths),
    };
  }
}
