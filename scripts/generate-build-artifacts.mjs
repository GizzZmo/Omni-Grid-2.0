/* global console, process */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root = process.cwd();
const distDir = path.join(root, 'dist');
const outputDir = path.join(root, 'generated-assets');

const hashFile = async filePath => {
  const buffer = await fs.readFile(filePath);
  return createHash('sha256').update(buffer).digest('hex');
};

const walkDir = async dir => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await walkDir(fullPath)));
    } else if (entry.isFile()) {
      results.push(fullPath);
    }
  }
  return results;
};

const run = async () => {
  let distExists = true;
  try {
    await fs.access(distDir);
  } catch {
    distExists = false;
  }

  if (!distExists) {
    throw new Error(
      'dist/ directory not found. Run `npm run build` before generating build artifacts.'
    );
  }

  await fs.mkdir(outputDir, { recursive: true });

  const allFiles = await walkDir(distDir);
  const artifacts = [];

  for (const fullPath of allFiles.sort()) {
    const stats = await fs.stat(fullPath);
    const relativePath = path.relative(root, fullPath).replace(/\\/g, '/');
    artifacts.push({
      file: path.relative(distDir, fullPath).replace(/\\/g, '/'),
      path: relativePath,
      bytes: stats.size,
      sha256: await hashFile(fullPath),
    });
  }

  const totalBytes = artifacts.reduce((sum, a) => sum + a.bytes, 0);
  const formatBytes = bytes => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const manifest = {
    generatedAt: new Date().toISOString(),
    count: artifacts.length,
    totalBytes,
    totalSize: formatBytes(totalBytes),
    artifacts,
  };

  const markdown = [
    '# Build Artifact Summary',
    '',
    `Generated at: ${manifest.generatedAt}`,
    '',
    `**Total files:** ${manifest.count}  `,
    `**Total size:** ${manifest.totalSize}`,
    '',
    '| File | Size | SHA-256 |',
    '| --- | ---: | --- |',
    ...artifacts.map(a => `| ${a.file} | ${formatBytes(a.bytes)} | \`${a.sha256}\` |`),
    '',
  ].join('\n');

  await fs.writeFile(
    path.join(outputDir, 'build-manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8'
  );
  await fs.writeFile(path.join(outputDir, 'build-summary.md'), markdown, 'utf8');
  console.log(
    `Generated build artifact manifest for ${manifest.count} files (${manifest.totalSize}).`
  );
};

run().catch(error => {
  console.error(error.message);
  process.exit(1);
});
