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

'use strict';

const OpenApiTransformerBase = require('openapi-transformer-base');

class AddTagToOperationIdsTransformer extends OpenApiTransformerBase {
  constructor(options) {
    super();
    this.tagSuffix = String((options && options.tagSuffix) || '');
  }

  transformOperation(op) {
    if (!op.tags || !op.operationId) {
      return op;
    }

    return {
      ...op,
      operationId: `${op.tags[0]}${this.tagSuffix}_${op.operationId}`,
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

module.exports = AddTagToOperationIdsTransformer;
