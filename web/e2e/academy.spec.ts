import { expect, test } from '@playwright/test';

async function navigateTo(page: import('@playwright/test').Page, index: number, isMobile: boolean): Promise<void> {
  if (isMobile) await page.locator('.mobile-menu').click();
  await page.locator('.sidebar nav button').nth(index).click();
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('inicio: ruta educativa y laboratorio adaptado responden al perfil', async ({ page }) => {
  await expect(page.locator('.welcome-band')).toBeVisible();
  await expect(page.locator('.education-flow')).toBeVisible();
  await expect(page.locator('.starter-toolbox')).toBeVisible();
  await expect(page.locator('.install-options').first()).toContainText('Opcion 1: Homebrew');
  await expect(page.locator('.install-options').first()).toContainText('brew install floci-io/floci/floci');
  await expect(page.locator('.install-options').first()).toContainText('Opcion 2: Script de instalacion');
  await expect(page.locator('.install-options').first()).toContainText('curl -fsSL https://floci.io/install.sh | sh');
  await expect(page.locator('.install-options').first()).toContainText('Opcion 3: Docker');
  await expect(page.locator('.install-options').first()).toContainText('floci/floci:latest');
  await expect(page.locator('.first-session')).toBeVisible();
  await expect(page.locator('.quick-lab-card')).toBeVisible();

  await page.locator('.student-config .segmented-control button').filter({ hasText: 'Windows' }).click();
  await page.locator('.student-config .language-select button').filter({ hasText: 'Python' }).click();

  await expect(page.locator('.first-session')).toContainText('PowerShell');
  await expect(page.locator('.quick-lab-card')).toContainText('app.py');
  await expect(page.locator('.quick-lab-card')).toContainText('pip install boto3');
});

test('inicio: configuracion guardada invalida vuelve a valores seguros', async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem('floci-academy-setup', JSON.stringify({ os: 'plan9', language: 'ruby' }));
  });
  await page.reload();

  await expect(page.locator('.quick-lab-card')).toContainText('app.mjs');
  await expect(page.locator('.quick-lab-card')).toContainText('node app.mjs');
});

test('modulos: lectura, ejercicios, notas y progreso se conectan', async ({ page, isMobile }) => {
  await page.locator('.student-config .language-select button').filter({ hasText: 'Python' }).click();
  await navigateTo(page, 1, isMobile);

  await expect(page.locator('.lesson-content > h1')).toBeVisible();
  await expect(page.locator('.rail-progress')).toHaveCount(18);
  await expect(page.locator('.module-trailer')).toBeVisible();
  await expect(page.locator('.active-course-profile')).toContainText('macOS con Python');
  await expect(page.locator('.active-course-profile')).toContainText('app.py');
  await expect(page.locator('.newcomer-guide')).toBeVisible();
  await expect(page.locator('.newcomer-guide')).toContainText('ENTENDER DE VERDAD');
  await expect(page.locator('.newcomer-guide')).toContainText('Analogía simple');
  await expect(page.locator('.newcomer-checks')).toContainText('3 ERRORES COMUNES');
  await expect(page.locator('.newcomer-checks')).toContainText('5 PREGUNTAS PARA VALIDAR');
  await expect(page.locator('.action-now')).toContainText('Hazlo hoy');

  await page.locator('.lesson-tabs button').nth(1).click();
  await expect(page.locator('.compact-install')).toContainText('Escoge solo una forma de instalar Floci');
  await expect(page.locator('.compact-install')).toContainText('Opcion 3: Docker');
  await expect(page.locator('.adaptive-lab')).toContainText('pip install boto3');
  await expect(page.locator('.adaptive-lab .code-line').first()).toBeVisible();
  await expect(page.locator('.adaptive-lab .tok-keyword').first()).toBeVisible();
  await expect(page.locator('.adaptive-lab .tok-string').first()).toBeVisible();
  await expect(page.locator('.process-guide .profile-line')).toContainText('Sistema: macOS');
  await expect(page.locator('.process-guide .profile-line')).toContainText('Lenguaje: Python');
  await expect(page.locator('.process-guide .profile-line')).toContainText('python app.py');
  await expect(page.locator('.guided-challenge').first()).toContainText('Verifica:');
  await expect(page.locator('.guided-challenge').first()).toContainText('Consejo tecnico:');
  await expect(page.locator('.guided-challenge code').first()).toBeVisible();

  await page.locator('.lesson-tabs button').nth(2).click();
  await page.locator('textarea').first().fill('Floci permite practicar cloud local con evidencia.');
  await page.locator('textarea').nth(1).fill('floci start');
  await page.locator('.complete-button').click();
  await expect(page.locator('.complete-button')).toContainText('completado');

  await page.reload();
  await navigateTo(page, 1, isMobile);
  await page.locator('.module-rail button').first().click();
  await page.locator('.lesson-tabs button').nth(2).click();
  await expect(page.locator('textarea').first()).toHaveValue('Floci permite practicar cloud local con evidencia.');
});

test('servicios y biblioteca: navegacion por contenido local funciona', async ({ page, isMobile }) => {
  await navigateTo(page, 2, isMobile);
  await expect(page.locator('.services-purpose')).toContainText('PARA QUE SIRVE ESTE MODULO');
  await expect(page.locator('.services-purpose')).toContainText('decisiones tecnicas');
  await expect(page.locator('.cloud-good-practices')).toContainText('CLEAN CLOUD');
  await expect(page.locator('.cloud-good-practices')).toContainText('Un servicio, una responsabilidad');
  await expect(page.locator('.device-learning-guide')).toContainText('ADAPTADO AL DISPOSITIVO');
  await expect(page.locator('.device-learning-guide')).toContainText('Movil');
  await expect(page.locator('.cloud-tabs')).toBeVisible();

  await page.locator('.cloud-tabs button').nth(3).click();
  await page.locator('.comparison-row').first().click();
  await expect(page.locator('.lesson-content > h1')).toBeVisible();

  await navigateTo(page, 3, isMobile);
  await expect(page.locator('.document-index')).toBeVisible();
  await page.locator('.document-index input').fill('S3');
  await page.locator('.document-list button').first().click();
  await expect(page.locator('.document-reader header h2')).toBeVisible();
  await expect(page.locator('.markdown-body')).toBeVisible();
});

test('modulos: java separa instalacion, codigo y ejecucion', async ({ page, isMobile }) => {
  await page.locator('.student-config .segmented-control button').filter({ hasText: 'Windows' }).click();
  await page.locator('.student-config .language-select button').nth(3).click();
  await navigateTo(page, 1, isMobile);
  await page.locator('.lesson-tabs button').nth(1).click();

  await expect(page.locator('.adaptive-lab')).toContainText('Windows');
  await expect(page.locator('.adaptive-lab')).toContainText('Java');
  await expect(page.locator('.adaptive-lab .sdk-panel')).toContainText('Elige una ruta: Maven o Gradle');
  await expect(page.locator('.adaptive-lab .sdk-panel')).toContainText('mvn -q archetype:generate');
  await expect(page.locator('.adaptive-lab .sdk-panel')).toContainText('gradle init --type java-application');
  await expect(page.locator('.adaptive-lab .code-title')).toContainText('Codigo');
  await expect(page.locator('.adaptive-lab .code-title')).toContainText('App.java');
  await expect(page.locator('.adaptive-lab .code-sample')).toContainText('S3Client.builder');
  await expect(page.locator('.adaptive-lab .code-sample')).not.toContainText('mvn exec:java');
  await expect(page.locator('.adaptive-lab .code-sample')).not.toContainText('gradle run');
  await expect(page.locator('.adaptive-lab .run-panel')).toContainText('EJECUTAR');
  await expect(page.locator('.adaptive-lab .run-panel')).toContainText('mvn exec:java');
  await expect(page.locator('.adaptive-lab .run-panel')).toContainText('gradle run');
});

test('proyecto final: mini proyectos, integrador y entorno activo son utiles', async ({ page, isMobile }) => {
  await navigateTo(page, 4, isMobile);

  await expect(page.locator('.project-view h1')).toHaveText('FlociOps');
  await expect(page.locator('.topic-projects article')).toHaveCount(16);
  await expect(page.locator('.topic-recipe')).toContainText('Buzón de archivos desde cero');
  await expect(page.locator('.topic-recipe')).toContainText('aws s3 ls s3://flociops-files');
  await expect(page.locator('.project-newcomer-guide')).toContainText('APRENDER EL MINI PROYECTO');
  await expect(page.locator('.project-newcomer-guide')).toContainText('Analog');
  await expect(page.locator('.project-newcomer-guide')).toContainText('3 ERRORES COMUNES');
  await expect(page.locator('.project-newcomer-guide')).toContainText('Hazlo hoy');
  await expect(page.locator('.topic-recipe .code-sample')).toBeVisible();
  await expect(page.locator('.topic-recipe .code-line').first()).toBeVisible();
  await page.locator('.topic-projects article').nth(2).click();
  await expect(page.locator('.topic-recipe')).toContainText('API de tareas desde cero');
  await expect(page.locator('.topic-recipe')).toContainText('FlociOpsTasks');
  await expect(page.locator('.project-newcomer-guide')).toContainText('API de tareas');
  await expect(page.locator('.project-newcomer-guide')).toContainText('FlociOpsTasks');
  await expect(page.locator('.flociops-stages article')).toHaveCount(6);
  await expect(page.locator('.project-environment')).toBeVisible();

  await page.locator('.project-config .segmented-control button').filter({ hasText: 'Linux' }).click();
  await page.locator('.project-config .language-select button').filter({ hasText: /^Go/ }).click();
  await expect(page.locator('.project-environment .profile-line')).toContainText('Sistema: Linux');
  await expect(page.locator('.project-environment .profile-line')).toContainText('Lenguaje: Go');
  await expect(page.locator('.project-environment .profile-line')).toContainText('go run main.go');
  await expect(page.locator('.project-environment')).toContainText('curl -fsSL');
  await expect(page.locator('.project-environment')).toContainText('go run main.go');
});

test('labs: java muestra maven y gradle, y todos los mini proyectos tienen codigo verificable', async ({ page, isMobile }) => {
  await navigateTo(page, 4, isMobile);

  const projectLanguages = page.locator('.project-config .language-select button');
  await projectLanguages.nth(3).click();
  await expect(page.locator('.project-environment')).toContainText('Ruta Maven');
  await expect(page.locator('.project-environment')).toContainText('Ruta Gradle');
  await expect(page.locator('.project-environment')).toContainText('mvn -q archetype:generate');
  await expect(page.locator('.project-environment')).toContainText('gradle init --type java-application');
  await expect(page.locator('.project-environment')).not.toContainText('Maven:');
  await expect(page.locator('.project-environment')).not.toContainText('| Gradle:');
  await expect(page.locator('.project-environment')).toContainText('http://localhost:4566');
  await expect(page.locator('.topic-recipe .code-sample')).toContainText('S3Client.builder');

  const topicCount = await page.locator('.topic-projects article').count();
  expect(topicCount).toBe(16);
  for (let index = 0; index < topicCount; index += 1) {
    await page.locator('.topic-projects article').nth(index).click();
    await expect(page.locator('.topic-recipe > .flow-heading h2')).toBeVisible();
    await expect(page.locator('.topic-recipe .code-sample pre code')).not.toHaveText('');
    await expect(page.locator('.topic-recipe')).toContainText('VERIFICAR');
  }

  for (let index = 0; index < 6; index += 1) {
    await projectLanguages.nth(index).click();
    await expect(page.locator('.project-environment .code-sample pre code')).not.toHaveText('');
  }
});

test('certificado: aparece al completar todos los modulos', async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem('floci-academy-progress', JSON.stringify({
      completedModules: Array.from({ length: 18 }, (_, index) => index),
      completedChallenges: {},
      notes: {},
      evidence: {},
    }));
  });
  await page.reload();

  await expect(page.locator('.completion-certificate')).toBeVisible();
  await expect(page.locator('.completion-certificate')).toContainText('Completaste Academia Floci');
});

test('responsive: vistas principales no generan scroll horizontal', async ({ page, isMobile }) => {
  if (!isMobile) test.skip();

  for (const navIndex of [0, 1, 2, 3, 4]) {
    await page.goto('/');
    if (navIndex > 0) {
      await navigateTo(page, navIndex, true);
    }

    const size = await page.evaluate(() => ({
      width: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(size.scrollWidth).toBeLessThanOrEqual(size.width);
  }
});
