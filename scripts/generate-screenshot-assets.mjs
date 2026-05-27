import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root = process.cwd();
const screenshotsDir = path.join(root, 'docs', 'screenshots');
const outputDir = path.join(root, 'generated-assets');

const hashFile = async filePath => {
  const buffer = await fs.readFile(filePath);
  return createHash('sha256').update(buffer).digest('hex');
};

const run = async () => {
  const entries = await fs.readdir(screenshotsDir, { withFileTypes: true });
  const files = entries
    .filter(entry => entry.isFile() && /\.(png|jpe?g|svg|webp)$/i.test(entry.name))
    .map(entry => entry.name)
    .sort((a, b) => a.localeCompare(b));

  if (files.length === 0) {
    throw new Error('No screenshot files found in docs/screenshots');
  }

  await fs.mkdir(outputDir, { recursive: true });

  const screenshots = [];
  for (const file of files) {
    const fullPath = path.join(screenshotsDir, file);
    const stats = await fs.stat(fullPath);
    screenshots.push({
      file,
      path: `docs/screenshots/${file}`,
      bytes: stats.size,
      sha256: await hashFile(fullPath),
    });
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    count: screenshots.length,
    screenshots,
  };

  const markdown = [
    '# Screenshot Asset Summary',
    '',
    `Generated at: ${manifest.generatedAt}`,
    '',
    '| Screenshot | Size (bytes) | SHA-256 |',
    '| --- | ---: | --- |',
    ...screenshots.map(item => `| ${item.file} | ${item.bytes} | \`${item.sha256}\` |`),
    '',
  ].join('\n');

  await fs.writeFile(
    path.join(outputDir, 'screenshots-manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8'
  );
  await fs.writeFile(path.join(outputDir, 'screenshots-summary.md'), markdown, 'utf8');
  console.log(`Generated screenshot manifest for ${manifest.count} assets.`);
};

run().catch(error => {
  console.error(error.message);
  process.exit(1);
});
