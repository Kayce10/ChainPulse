#!/usr/bin/env node
/**
 * validate-quarantine-registry.js  –  ChainPulse CI helper
 *
 * Validates the quarantine registry at .github/quarantine/registry.json.
 *
 * Rules enforced:
 *  1. File must be valid JSON.
 *  2. Top-level keys `frontend` and `backend` must be arrays.
 *  3. Every entry must have:
 *       - `id`          (string, non-empty, unique across the registry)
 *       - `reason`      (string, non-empty)
 *       - `quarantined_at` (ISO-8601 date string)
 *       - `ticket`      (string matching /^[A-Z]+-\d+$/ or a URL)
 *  4. No entry may have been quarantined for more than MAX_DAYS days
 *     (default 90) without a `review_by` date that has already passed.
 *  5. No duplicate `id` values within the same section or across sections.
 *
 * Exit codes:
 *   0 – registry is valid
 *   1 – validation failed (details printed to stderr)
 */

'use strict';

const fs = require('fs');
const path = require('path');

const REGISTRY_PATH = path.resolve(
  __dirname,
  '../.github/quarantine/registry.json'
);
const MAX_DAYS = Number(process.env.QUARANTINE_MAX_DAYS ?? 90);
const TICKET_RE = /^[A-Z]+-\d+$|^https?:\/\/.+/;

// ── helpers ────────────────────────────────────────────────────────────────────

function isoToDate(str) {
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

function daysBetween(a, b) {
  return Math.floor((b - a) / 86_400_000);
}

// ── main ───────────────────────────────────────────────────────────────────────

let raw;
try {
  raw = fs.readFileSync(REGISTRY_PATH, 'utf8');
} catch (err) {
  process.stderr.write(`ERROR: Cannot read registry at ${REGISTRY_PATH}\n  ${err.message}\n`);
  process.exit(1);
}

let registry;
try {
  registry = JSON.parse(raw);
} catch (err) {
  process.stderr.write(`ERROR: Registry is not valid JSON.\n  ${err.message}\n`);
  process.exit(1);
}

const errors = [];
const now = new Date();
const seenIds = new Set();

for (const section of ['frontend', 'backend']) {
  const entries = registry[section];

  if (!Array.isArray(entries)) {
    errors.push(`"${section}" must be an array`);
    continue;
  }

  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    const prefix = `${section}[${i}]`;

    // id
    if (typeof e.id !== 'string' || e.id.trim() === '') {
      errors.push(`${prefix}.id must be a non-empty string`);
    } else if (seenIds.has(e.id)) {
      errors.push(`${prefix}.id "${e.id}" is duplicated in the registry`);
    } else {
      seenIds.add(e.id);
    }

    // reason
    if (typeof e.reason !== 'string' || e.reason.trim() === '') {
      errors.push(`${prefix}.reason must be a non-empty string`);
    }

    // quarantined_at
    const quarantinedAt = isoToDate(e.quarantined_at);
    if (!quarantinedAt) {
      errors.push(`${prefix}.quarantined_at must be a valid ISO-8601 date`);
    } else {
      const age = daysBetween(quarantinedAt, now);
      if (age > MAX_DAYS) {
        const reviewBy = e.review_by ? isoToDate(e.review_by) : null;
        if (!reviewBy || reviewBy < now) {
          errors.push(
            `${prefix}.id "${e.id}" has been quarantined for ${age} days (>${MAX_DAYS}). ` +
            `Update "review_by" or remove it from the registry.`
          );
        }
      }
    }

    // ticket
    if (typeof e.ticket !== 'string' || !TICKET_RE.test(e.ticket.trim())) {
      errors.push(
        `${prefix}.ticket must be a Jira-style key (e.g. "CP-123") or a URL`
      );
    }
  }
}

if (errors.length > 0) {
  process.stderr.write(`\nQuarantine registry validation FAILED (${errors.length} error(s)):\n\n`);
  for (const err of errors) {
    process.stderr.write(`  ✗ ${err}\n`);
  }
  process.stderr.write('\n');
  process.exit(1);
}

const total = (registry.frontend?.length ?? 0) + (registry.backend?.length ?? 0);
process.stdout.write(
  `Quarantine registry valid ✓  (${total} quarantined test(s))\n`
);
process.exit(0);
