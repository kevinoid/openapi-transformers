/**
 * Script to remove response content for the text/html media type.
 *
 * Autorest does not provide a good way to consume text/html:
 * - If the schema has type: string (with or without format: binary), the
 *   generated method attempts to JSON-decode the HTML, which fails.
 * - If the schema has type: file, Autorest calls HttpContent.ReadAsStreamAsync
 *   and returns the Stream, which complicates conversion to string, since the
 *   caller can't call HttpContent.ReadAsStringAsync (which would cause
 *   "InvalidOperationException: The stream was already consumed. It cannot be
 *   read again.") and must reimplement charset detection to use on Stream.
 *
 * @copyright Copyright 2020 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import OpenApiTransformerBase from 'openapi-transformer-base';

function isHtml(mediaType) {
  return /^\s*text\/html\s*(;.*)?$/i.test(mediaType);
}

export default class RemoveHtmlResponseContentTransformer
  extends OpenApiTransformerBase {
  // eslint-disable-next-line class-methods-use-this
  transformResponse(response) {
    if (!response) {
      return response;
    }

    let newResponse = response;

    // Remove schema from OpenAPI 3 Media Type Objects
    const { content, schema } = newResponse;
    if (content) {
      const htmlTypes = Object.keys(content).filter(isHtml);
      if (htmlTypes.length > 0) {
        const newContent = { ...content };
        for (const htmlType of htmlTypes) {
          const newMediaType = { ...content[htmlType] };
          delete newMediaType.schema;
          delete newMediaType.encoding;
          newContent[htmlType] = newMediaType;
        }
        newResponse = {
          ...newResponse,
          content: newContent,
        };
      }
    }

    // Remove schema from OpenAPI 2 response.schema
    if (schema !== undefined) {
      newResponse = { ...newResponse };
      delete newResponse.schema;
    }

    return newResponse;
  }

  transformOperation(operation) {
    if (!operation || !operation.responses) {
      return operation;
    }

    // Only transform OpenAPI 2.0 if the operation only produces HTML
    // (since one schema is shared by all)
    const { produces } = operation;
    if (Array.isArray(produces) && !produces.every(isHtml)) {
      return operation;
    }

    return super.transformOperation(operation);
  }
}
