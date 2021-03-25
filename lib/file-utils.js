/**
 * Utility functions for dealing with files and file descriptors.
 *
 * @copyright Copyright 2019 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

'use strict';

const fs = require('fs');
const { promisify } = require('util');

/** Promise wrapper for fs.readFile. */
exports.readFile = promisify(fs.readFile);

/** Promise wrapper for fs.writeFile with fixes for file descriptors.
 *
 * @private
 */
exports.writeFile = function writeFile(filePathOrDesc, data, options) {
  return new Promise((resolve, reject) => {
    // Before nodejs/node#23709, fs.writeFile would seek FD.
    // Both fs.writeFile and fs.createWriteStream on stdout/stderr FDs can
    // result in truncation due to lack of flush before exit (see
    // nodejs/node#6379, nodejs/node#6456, and many others).
    // Use process.stdout/stderr which work reliably.
    if (filePathOrDesc === 1) {
      process.stdout
        .once('error', reject)
        .write(data, resolve);
    } else if (filePathOrDesc === 2) {
      process.stderr
        .once('error', reject)
        .write(data, resolve);
    } else if (typeof filePathOrDesc === 'number') {
      fs.createWriteStream(
        undefined,
        {
          fd: filePathOrDesc,
          encoding: options && options.encoding,
        },
      )
        .once('error', reject)
        .end(data, resolve);
    } else {
      fs.writeFile(
        filePathOrDesc,
        data,
        options,
        (err) => (err ? reject(err) : resolve()),
      );
    }
  });
};
