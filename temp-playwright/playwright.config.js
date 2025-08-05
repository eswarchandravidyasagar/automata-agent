const { defineConfig, devices } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './',
  timeout: 60000,
  use: {
    headless: true,
    navigationTimeout: 30000,
    actionTimeout: 15000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  outputDir: 'test-results/',
});