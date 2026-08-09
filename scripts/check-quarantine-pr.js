#!/usr/bin/env node
/**
 * check-quarantine-pr.js  –  ChainPulse CI helper
 *
 * On a pull-request run this script:
 *  1. Reads the diff of .github/quarantine/registry.json (via git).
 *  2. Warns if a PR adds new quarantine entries without a linked ticket.
 *  3. Blocks the PR if an entry in the registry no longer has a matching
 *     test file on disk (stale quarantine).
 *
 * Usage:
 *   BASE_SHA=<merge-base> node scripts/check-quarantine-pr.js
 *
 * Environment variables:
 *   BASE_SHA             – git SHA to diff against (default: origin/main)
 *   FRONTEND_TEST_ROOT   – where frontend tests live (default: frontend/src)
 *   BACKEND_TEST_ROOT    – where backend tests live  (default: backend/tests)
 *
 * Exit codes:
 *   0 – all checks passed
 *   1 – blocking issues found
 */

'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const REGISTRY_PATH = path.join(ROOT, '.github/quarantine/registry.json');
const BASE_SHA = process.env.BASE_SHA ?? 'origin/main';
const FRONTEND_ROOT = path.join(ROOT, process.env.FRONTEND_TEST_ROOT ?? 'frontend/src');
const BACKEND_ROOT  = path.join(ROOT, process.env.BACKEND_TEST_ROOT  ?? 'backend/tests');

// ── helpers ────────────────────────────────────────────────────────────────────

function run(cmd) {
  try {
    return execSync(cmd, { cwd: ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
  } catch {
    return '';
  }
}

function fileExistsInTree(root, pattern) {
  // pattern may be a partial path like "health-api.test.ts" or "analytics_tests"
  const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(escaped, 'i');
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (walk(fullPath)) return true;
      } else if (re.test(entry.name)) {
        return true;
      }
    }
    return false;
  }
  return walk(root);
}

// ── load registry ──────────────────────────────────────────────────────────────

let registry;
try {
  registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
} catch (err) {
  process.stderr.write(`ERROR: Cannot read registry: ${err.message}\n`);
  process.exit(1);
}

// ── detect newly-added entries in this PR ──────────────────────────────────────

const diffOutput = run(`git diff ${BASE_SHA} -- .github/quarantine/registry.json`);
const addedLines = diffOutput
  .split('\n')
  .filter(l => l.startsWith('+') && !l.startsWith('+++'));

const addedIds = [];
for (const line of addedLines) {
  const m = line.match(/"id"\s*:\s*"([^"]+)"/);
  if (m) addedIds.push(m[1]);
}

// ── stale-entry check ─────────────────────────────────────────────────────────

const errors   = [];
const warnings = [];

for (const section of ['frontend', 'backend']) {
  const root = section === 'frontend' ? FRONTEND_ROOT : BACKEND_ROOT;
  const entries = registry[section] ?? [];

  for (const entry of entries) {
    // Check ticket presence for newly-added entries
    if (addedIds.includes(entry.id)) {
      if (!entry.ticket || entry.ticket.trim() === '') {
        warnings.push(`New quarantine entry "${entry.id}" is missing a ticket reference.`);
      }
    }

    // Stale-entry check: test file must still exist on disk
    if (entry.file) {
      const exists = fs.existsSync(path.join(ROOT, entry.file)) ||
                     fileExistsInTree(root, path.basename(entry.file));
      if (!exists) {
        errors.push(
          `Stale quarantine entry "${entry.id}" (${section}): ` +
          `test file "${entry.file}" no longer exists. Remove it from the registry.`
        );
      }
    }
  }
}

// ── report ────────────────────────────────────────────────────────────────────

if (warnings.length > 0) {
  process.stdout.write('\nQuarantine PR warnings:\n');
  for (const w of warnings) process.stdout.write(`  ⚠  ${w}\n`);
}

if (errors.length > 0) {
  process.stderr.write(`\nQuarantine PR check FAILED (${errors.length} issue(s)):\n`);
  for (const e of errors) process.stderr.write(`  ✗ ${e}\n`);
  process.stderr.write('\n');
  process.exit(1);
}

const newCount = addedIds.length;
process.stdout.write(
  `\nQuarantine PR check passed ✓` +
  (newCount > 0 ? `  (${newCount} new entry/entries noted)` : '') +
  '\n'
);
process.exit(0);
