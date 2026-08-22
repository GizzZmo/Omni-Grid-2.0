#!/usr/bin/env node
/**
 * Measure production bundle sizes and print a TTI-oriented report.
 *
 * Usage: node scripts/measure-bundle.mjs
 * Requires a prior `vite build` (or runs one if dist/ is missing).
 */

import { execSync } from 'node:child_process';
import { readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const TARGETS = {
  initialJsGzipApprox: 500 * 1024,
  totalJs: 2.5 * 1024 * 1024,
};

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

function walk(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else acc.push({ path: p, size: st.size });
  }
  return acc;
}

if (!existsSync(DIST)) {
  console.log('dist/ missing — running vite build…');
  execSync('npx vite build', { stdio: 'inherit' });
}

const files = walk(DIST);
const js = files.filter(f => f.path.endsWith('.js'));
const css = files.filter(f => f.path.endsWith('.css'));
const totalJs = js.reduce((s, f) => s + f.size, 0);
const totalCss = css.reduce((s, f) => s + f.size, 0);
const total = files.reduce((s, f) => s + f.size, 0);

const sortedJs = [...js].sort((a, b) => b.size - a.size);

console.log('\n╔══════════════════════════════════════════════════════╗');
console.log('║         OMNI-GRID BUNDLE / TTI REPORT                ║');
console.log('╚══════════════════════════════════════════════════════╝\n');

console.log(`Total dist size:  ${formatBytes(total)}`);
console.log(`JS total:         ${formatBytes(totalJs)}`);
console.log(`CSS total:        ${formatBytes(totalCss)}`);
console.log(`JS file count:    ${js.length}`);
console.log('');

console.log('Top JS chunks:');
for (const f of sortedJs.slice(0, 15)) {
  const rel = f.path.replace(/^dist\//, '');
  console.log(`  ${formatBytes(f.size).padStart(10)}  ${rel}`);
}

console.log('\n── Targets (from ROADMAP) ──');
const gzipApprox = totalJs * 0.33;
console.log(
  `Approx gzipped JS (~33%): ${formatBytes(gzipApprox)}  (target initial < ${formatBytes(TARGETS.initialJsGzipApprox)})`
);
console.log(
  gzipApprox <= TARGETS.initialJsGzipApprox
    ? '  ✓ Under initial gzip budget (heuristic)'
    : '  ⚠ Over initial gzip budget — lean on code-splitting / lazy widgets'
);
console.log(
  totalJs <= TARGETS.totalJs
    ? `  ✓ Total JS under ${formatBytes(TARGETS.totalJs)}`
    : `  ⚠ Total JS over ${formatBytes(TARGETS.totalJs)}`
);

console.log('\nTTI tips:');
console.log('  • Lazy widgets already code-split heavy surfaces (Monaco, marketplace, …)');
console.log('  • Prefer network idle + first contentful paint in Lighthouse on mobile');
console.log('  • Run: npx lighthouse http://localhost:4173 --preset=desktop --only-categories=performance');
console.log('');
