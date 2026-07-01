import { expect, test } from '@playwright/test';

const previousBrand = ['F', 'loci'].join('');
const fakeUrl = ['cloud-local', '.io'].join('');

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('inicio: muestra la ruta guiada Cloud Local sin marca anterior', async ({ page }) => {
  await expect(page.locator('.lms-topbar')).toContainText('Academia Cloud Local');
  await expect(page.locator('.course-hero h1')).toContainText('Aprende cloud local con orden');
  await expect(page.locator('.player-main h2')).toContainText('Clase 1: Qué es Docker y por qué lo necesitas');
  await expect(page.locator('.player-aside button')).toHaveCount(5);
  await expect(page.locator('.content-band#cursos')).toContainText('Catálogo completo');
  await expect(page.locator('body')).not.toContainText(previousBrand);
});

test('catalogo: enseña metodologia, proveedores y cursos disponibles', async ({ page }) => {
  await page.goto('/catalogo');

  await expect(page.locator('.catalog-topbar')).toContainText('Academia Cloud Local');
  await expect(page.locator('.catalog-hero h1')).toContainText('Escoge una ruta');
  await expect(page.locator('.cloud-levels article')).toHaveCount(4);
  await expect(page.locator('.provider-matrix')).toContainText('AWS local · 4566');
  await expect(page.locator('.provider-matrix')).toContainText('Azure local · 4577');
  await expect(page.locator('.provider-matrix')).toContainText('GCP local · 4588');
  await expect(page.locator('body')).not.toContainText(previousBrand);
});

test('curso cloud: abre el lector por modulos con contenido local multi-nube', async ({ page }) => {
  await page.goto('/curso/cloud');

  await expect(page.locator('body')).toContainText('Instalación y primeros pasos con cloud local');
  await expect(page.locator('body')).toContainText('AWS local en 4566');
  await expect(page.locator('body')).toContainText('Azure local en 4577');
  await expect(page.locator('body')).toContainText('GCP local en 4588');
  await expect(page.locator('body')).not.toContainText(fakeUrl);
});

test('ruta antigua de laboratorio vuelve al inicio nuevo', async ({ page }) => {
  await page.goto(`/laboratorio/${previousBrand.toLowerCase()}`);

  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('.lms-topbar')).toContainText('Academia Cloud Local');
});
