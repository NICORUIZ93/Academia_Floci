import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 8_000 },
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:4201',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'node node_modules/@angular/cli/bin/ng.js serve --host 127.0.0.1 --port 4201',
    url: 'http://127.0.0.1:4201',
    reuseExistingServer: true,
    timeout: 90_000,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 5'], viewport: { width: 390, height: 844 } } },
  ],
});
