#!/usr/bin/env node
/**
 * @copyright Copyright 2024 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

/* eslint-disable no-console */

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { debuglog } from 'node:util';

const debug = debuglog('openapi-transformers-preversion');

const packagePath = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const indexJsPath = path.join(packagePath, 'index.js');
const indexJs = await readFile(indexJsPath, { encoding: 'utf8' });

const packageJsonPath = path.join(packagePath, 'package.json');
const packageJsonStr = await readFile(packageJsonPath, { encoding: 'utf8' });
const packageJson = JSON.parse(packageJsonStr);

const readmePath = path.join(packagePath, 'README.md');
const readme = await readFile(readmePath, { encoding: 'utf8' });

let errors = 0;
const packageFiles = await readdir(packagePath);
for (const packageFile of packageFiles) {
  if (packageFile.slice(-3) === '.js'
    && packageFile !== 'index.js') {
    debug('Checking %s...', packageFile);

    const dotPackageFile = `./${packageFile}`;

    if (!indexJs.includes(dotPackageFile)) {
      console.error('Error: %s not exported from index.js', dotPackageFile);
      errors += 1;
    }

    if (packageJson.exports[dotPackageFile] !== dotPackageFile) {
      console.error('Error: %s not in package.json#exports', dotPackageFile);
      errors += 1;
    }

    if (!readme.includes(dotPackageFile)) {
      console.error('Error: %s not in README.md', dotPackageFile);
      errors += 1;
    }
  }
}

debug('preversion checks completed with %d errors', errors);

process.exitCode = errors > 0 ? 1 : 0;
