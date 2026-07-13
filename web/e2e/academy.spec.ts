import { expect, test } from '@playwright/test';

const previousBrand = ['F', 'loci'].join('');

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('inicio: muestra la biblioteca de cursos', async ({ page }) => {
  await expect(page.locator('.catalog-topbar')).toContainText('Academia Floci');
  await expect(page.locator('.track-card').first()).toBeVisible();
  await expect(page.locator('body')).not.toContainText(previousBrand);
});

test('catalogo: lista los tracks agrupados sin secciones de marketing', async ({ page }) => {
  await page.goto('/catalogo');

  await expect(page.locator('.catalog-topbar')).toContainText('Academia Floci');
  await expect(page.locator('.track-group h2').first()).toBeVisible();
  await expect(page.locator('.track-card')).toHaveCount(12);
  await expect(page.locator('body')).not.toContainText(previousBrand);
});

test('curso cloud: abre el lector por capítulos con el contenido base de Floci', async ({ page }) => {
  await page.goto('/curso/cloud');

  await expect(page.locator('body')).toContainText('Introducción y preparación');
  await expect(page.locator('body')).toContainText('Docker');
});

test('ruta antigua de laboratorio vuelve al inicio nuevo', async ({ page }) => {
  await page.goto(`/laboratorio/${previousBrand.toLowerCase()}`);

  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('.catalog-topbar')).toContainText('Academia Floci');
});
