#!/usr/bin/env node
/**
 * run-quarantine.js  –  ChainPulse CI helper
 *
 * Runs quarantined tests in isolation and collects results.
 *
 * Flow:
 *  1. Read .github/quarantine/registry.json.
 *  2. For each section (frontend / backend):
 *       - Skip entries with `skip: true`.
 *       - Run the test in its own process with a configurable timeout.
 *       - Record pass / fail / timeout.
 *  3. Write a JSON report to $REPORT_PATH (default: quarantine-report.json).
 *  4. Exit 0 always – quarantine failures do NOT block CI.
 *     (The report is surfaced in the workflow summary instead.)
 *
 * Environment variables:
 *   REPORT_PATH        – output file path      (default: quarantine-report.json)
 *   TIMEOUT_MS         – per-test timeout ms   (default: 60000)
 *   FRONTEND_TEST_CMD  – base command for fe   (default: pnpm vitest run)
 *   BACKEND_TEST_CMD   – base command for be   (default: cargo test)
 *   FRONTEND_DIR       – frontend working dir  (default: frontend)
 *   BACKEND_DIR        – backend working dir   (default: backend)
 */

'use strict';

const { spawnSync } = require('child_process');
const fs   = require('fs');
const path = require('path');

const ROOT            = path.resolve(__dirname, '..');
const REGISTRY_PATH   = path.join(ROOT, '.github/quarantine/registry.json');
const REPORT_PATH     = path.resolve(process.env.REPORT_PATH   ?? path.join(ROOT, 'quarantine-report.json'));
const TIMEOUT_MS      = Number(process.env.TIMEOUT_MS          ?? 60_000);
const FRONTEND_CMD    = (process.env.FRONTEND_TEST_CMD          ?? 'pnpm vitest run').split(' ');
const BACKEND_CMD     = (process.env.BACKEND_TEST_CMD           ?? 'cargo test').split(' ');
const FRONTEND_DIR    = path.join(ROOT, process.env.FRONTEND_DIR ?? 'frontend');
const BACKEND_DIR     = path.join(ROOT, process.env.BACKEND_DIR  ?? 'backend');

// ── helpers ────────────────────────────────────────────────────────────────────

function runTest({ cmd, args, cwd, env }) {
  const start = Date.now();
  const result = spawnSync(cmd, args, {
    cwd,
    env: { ...process.env, ...env },
    timeout: TIMEOUT_MS,
    encoding: 'utf8',
    stdio: 'pipe',
  });
  return {
    duration_ms: Date.now() - start,
    exit_code: result.status ?? -1,
    timed_out: result.error?.code === 'ETIMEDOUT',
    stdout: (result.stdout ?? '').slice(0, 4096),
    stderr: (result.stderr ?? '').slice(0, 4096),
  };
}

// ── load registry ──────────────────────────────────────────────────────────────

let registry;
try {
  registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
} catch (err) {
  process.stderr.write(`ERROR reading registry: ${err.message}\n`);
  process.exit(0); // don't block CI
}

// ── run tests ─────────────────────────────────────────────────────────────────

const report = {
  generated_at: new Date().toISOString(),
  timeout_ms: TIMEOUT_MS,
  results: [],
};

function processSection(section, entries, baseCmd, cwd) {
  for (const entry of entries) {
    if (entry.skip) {
      process.stdout.write(`  SKIP  [${section}] ${entry.id}\n`);
      report.results.push({ id: entry.id, section, status: 'skipped', duration_ms: 0 });
      continue;
    }

    process.stdout.write(`  RUN   [${section}] ${entry.id} ... `);

    // Build test filter arg from entry.file or entry.test_name
    const filter = entry.test_name ?? (entry.file ? path.basename(entry.file, path.extname(entry.file)) : entry.id);

    let cmd, args, env = {};
    if (section === 'frontend') {
      [cmd, ...args] = [...baseCmd, '--reporter=verbose', filter];
    } else {
      // cargo test <filter> -- --include-ignored
      [cmd, ...args] = [...baseCmd, filter, '--', '--include-ignored'];
      env = { DATABASE_URL: 'sqlite::memory:', REDIS_URL: 'redis://127.0.0.1:6379' };
    }

    const run = runTest({ cmd, args, cwd, env });

    let status;
    if (run.timed_out) {
      status = 'timeout';
    } else if (run.exit_code === 0) {
      status = 'passed';
    } else {
      status = 'failed';
    }

    process.stdout.write(`${status.toUpperCase()}  (${run.duration_ms}ms)\n`);

    report.results.push({
      id: entry.id,
      section,
      ticket: entry.ticket,
      status,
      duration_ms: run.duration_ms,
      exit_code: run.exit_code,
      stdout: run.stdout,
      stderr: run.stderr,
    });
  }
}

process.stdout.write('\nRunning quarantined tests in isolation...\n\n');
processSection('frontend', registry.frontend ?? [], FRONTEND_CMD, FRONTEND_DIR);
processSection('backend',  registry.backend  ?? [], BACKEND_CMD,  BACKEND_DIR);

// ── summary ────────────────────────────────────────────────────────────────────

const total   = report.results.length;
const passed  = report.results.filter(r => r.status === 'passed').length;
const failed  = report.results.filter(r => r.status === 'failed').length;
const timedout= report.results.filter(r => r.status === 'timeout').length;
const skipped = report.results.filter(r => r.status === 'skipped').length;

process.stdout.write(
  `\nQuarantine run complete: ` +
  `${total} total | ${passed} passed | ${failed} failed | ${timedout} timed out | ${skipped} skipped\n`
);

// ── write report ───────────────────────────────────────────────────────────────

fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');
process.stdout.write(`Report written to ${REPORT_PATH}\n`);

// ── GitHub Step Summary ────────────────────────────────────────────────────────

const summaryPath = process.env.GITHUB_STEP_SUMMARY;
if (summaryPath) {
  const rows = report.results
    .map(r => {
      const icon = r.status === 'passed' ? '✅' : r.status === 'skipped' ? '⏭️' : r.status === 'timeout' ? '⏱️' : '❌';
      return `| ${icon} | \`${r.id}\` | ${r.section} | ${r.status} | ${r.duration_ms}ms | ${r.ticket ?? '—'} |`;
    })
    .join('\n');

  const md = `## Quarantine Run Results\n\n` +
    `| | Test ID | Section | Status | Duration | Ticket |\n` +
    `|---|---|---|---|---|---|\n` +
    `${rows || '| — | No quarantined tests | — | — | — | — |'}\n\n` +
    `**${passed}** passed · **${failed}** failed · **${timedout}** timed out · **${skipped}** skipped\n`;

  fs.appendFileSync(summaryPath, md, 'utf8');
}

// Exit 0 – quarantine failures are informational, never block CI
process.exit(0);
