import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('inicio: muestra la biblioteca de cursos', async ({ page }) => {
  await expect(page.locator('.catalog-topbar')).toContainText('Academia Floci');
  await expect(page.locator('.track-card').first()).toBeVisible();
  await expect(page.locator('.hero-stats')).toContainText('14');
});

test('catalogo: lista los tracks agrupados sin secciones de marketing', async ({ page }) => {
  await page.goto('/catalogo');

  await expect(page.locator('.catalog-topbar')).toContainText('Academia Floci');
  await expect(page.locator('.track-group h3').first()).toBeVisible();
  await expect(page.locator('.track-card')).toHaveCount(14);
  await expect(page.locator('.hero-stats strong').nth(2)).not.toHaveText('—');
});

test('curso cloud: abre el lector por capítulos con el contenido base de Floci', async ({ page }) => {
  await page.goto('/curso/cloud');

  await expect(page.locator('body')).toContainText('Introducción y preparación');
  await expect(page.locator('body')).toContainText('Docker');
});

test('ruta antigua de laboratorio vuelve al inicio nuevo', async ({ page }) => {
  await page.goto('/laboratorio/floci');

  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('.catalog-topbar')).toContainText('Academia Floci');
});

test('búsqueda: encuentra un tema real y navega a su fragmento', async ({ page }) => {
  await page.goto('/curso/angular/0');
  await page.getByRole('button', { name: 'Buscar cursos, módulos y temas' }).click();
  await page.getByRole('textbox', { name: 'Buscar cursos, módulos y temas' }).fill('TypeScript');
  const result = page.locator('.palette-result').first();
  await expect(result).toBeVisible();
  await result.click();
  await expect(page).toHaveURL(/\/curso\/.+\/\d+/);
});

test('aprendizaje: presenta el proyecto integrador sin evaluación generada', async ({ page }) => {
  await page.goto('/curso/angular/0');
  await expect(page.locator('.module-practice')).toHaveCount(0);
  await expect(page.locator('.module-quiz')).toHaveCount(0);
  await expect(page.locator('body')).not.toContainText('XP');
  await expect(page.locator('.track-project')).toContainText('Centro de control logístico');
  await expect(page.locator('.topic-troubleshooting').first()).toBeAttached();
});
