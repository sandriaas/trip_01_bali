#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PLAYWRITER_SOURCE = path.join(__dirname, 'google_place_cache.playwriter.js');

function parseArgs(argv) {
  const options = {
    refresh: false,
    limit: 0,
  };

  argv.forEach((argument) => {
    if (argument === '--refresh') {
      options.refresh = true;
      return;
    }
    if (argument.startsWith('--limit=')) {
      options.limit = Number(argument.slice('--limit='.length)) || 0;
    }
  });

  return options;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
    ...options,
  });

  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    throw new Error(`${command} ${args.join(' ')} failed with exit code ${result.status}`);
  }

  return result.stdout;
}

const { refresh, limit } = parseArgs(process.argv.slice(2));
const source = fs.readFileSync(PLAYWRITER_SOURCE, 'utf8');
const bootstrappedSource = [
  `const TRIP_ROOT = ${JSON.stringify(ROOT)};`,
  `const TRIP_REFRESH = ${refresh ? 'true' : 'false'};`,
  `const TRIP_LIMIT = ${Number.isFinite(limit) ? limit : 0};`,
  source,
].join('\n');

const sessionOutput = run('playwriter', ['session', 'new']);
process.stdout.write(sessionOutput);

const sessionMatch = sessionOutput.match(/Session\s+(\d+)\s+created/i);
if (!sessionMatch) {
  throw new Error('Could not determine the Playwriter session id.');
}

const sessionId = sessionMatch[1];
const extraction = spawnSync('playwriter', ['-s', sessionId, '--timeout', '1800000', '-e', bootstrappedSource], {
  cwd: ROOT,
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
});

if (extraction.stdout) process.stdout.write(extraction.stdout);
if (extraction.stderr) process.stderr.write(extraction.stderr);

if (extraction.error) {
  throw extraction.error;
}
if (extraction.status !== 0) {
  throw new Error(`Playwriter extraction failed with exit code ${extraction.status}`);
}
