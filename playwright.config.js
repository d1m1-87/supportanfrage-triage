// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'https://supportanfrage-triage.vercel.app/',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
});
