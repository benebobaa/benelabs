import { defineCliConfig } from 'sanity/cli';

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET;

if (!projectId || !dataset) {
  throw new Error('Missing SANITY_PROJECT_ID or SANITY_DATASET in ../.env');
}

export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },
});
