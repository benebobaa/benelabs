import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const loadEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) return {};
  const contents = fs.readFileSync(filePath, 'utf8');
  const values = {};

  contents.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) return;
    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (value.startsWith('"') || value.startsWith("'")) {
      const quote = value[0];
      const endIndex = value.indexOf(quote, 1);
      value = endIndex === -1 ? value.slice(1) : value.slice(1, endIndex);
    } else {
      const commentIndex = value.indexOf('#');
      if (commentIndex !== -1) {
        value = value.slice(0, commentIndex).trim();
      }
    }

    values[key] = value;
  });

  return values;
};

const args = process.argv.slice(2);
if (!args.length) {
  console.error('Usage: node scripts/run.mjs <command>');
  process.exit(1);
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootEnvPath = path.resolve(scriptDir, '..', '..', '.env');
const envValues = loadEnvFile(rootEnvPath);

const projectId = envValues.SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID;
const dataset = envValues.SANITY_DATASET || process.env.SANITY_DATASET;

if (!projectId || !dataset) {
  console.error('Missing SANITY_PROJECT_ID or SANITY_DATASET in ../.env');
  process.exit(1);
}

const env = {
  ...process.env,
  SANITY_PROJECT_ID: projectId,
  SANITY_DATASET: dataset,
  SANITY_STUDIO_PROJECT_ID: projectId,
  SANITY_STUDIO_DATASET: dataset,
};

const child = spawn('sanity', args, {
  stdio: 'inherit',
  env,
  shell: true,
});

child.on('close', (code) => {
  process.exit(code ?? 0);
});
