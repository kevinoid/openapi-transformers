#!/usr/bin/env node
/**
 * @copyright Copyright 2025 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import checkExports from '../script-lib/check-exports.js';

process.exitCode = await checkExports(process.argv, process);
