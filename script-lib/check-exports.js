/**
 * @copyright Copyright 2024-2025 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { debuglog } from 'node:util';

const debug = debuglog('openapi-transformers:check-exports');

const packagePath = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

export default async function checkExports(args, options) {
  const indexJsPath = path.join(packagePath, 'index.js');
  const indexJsP = readFile(indexJsPath, { encoding: 'utf8' });

  const packageJsonPath = path.join(packagePath, 'package.json');
  const packageJsonStrP = readFile(packageJsonPath, { encoding: 'utf8' });

  const readmePath = path.join(packagePath, 'README.md');
  const readmeP = readFile(readmePath, { encoding: 'utf8' });

  const packageFilesP = readdir(packagePath);

  const indexJs = await indexJsP;
  const packageJson = JSON.parse(await packageJsonStrP);
  const readme = await readmeP;

  let hasError = false;
  for (const packageFile of await packageFilesP) {
    if (packageFile.slice(-3) === '.js'
      && packageFile !== 'index.js') {
      debug('Checking %s...', packageFile);

      const dotPackageFile = `./${packageFile}`;

      if (!indexJs.includes(dotPackageFile)) {
        options.stderr.write(
          `Error: ${dotPackageFile} not exported from index.js\n`,
        );
        hasError = true;
      }

      if (packageJson.exports[dotPackageFile] !== dotPackageFile) {
        options.stderr.write(
          `Error: ${dotPackageFile} not in package.json#exports\n`,
        );
        hasError = true;
      }

      const packageFileLink = `](${packageFile})`;
      if (!readme.includes(packageFileLink)) {
        options.stderr.write(`Error: ${packageFileLink} not in README.md\n`);
        hasError = true;
      }
    }
  }

  return hasError ? 1 : 0;
}
