#!/usr/bin/env sh
set -eu

ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$ROOT"

node <<'NODE'
const fs = require('fs');

const requiredFiles = [
  'README.md',
  'docker-compose.yml',
  '.env.example',
  'web/index.html',
  'web/README.md',
  'web/public/content/es/pasos.md',
  'web/public/content/es/cuaderno-progreso.md',
  'web/public/content/es/guia-completa.md',
  'web/public/content/manifest.json',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    throw new Error(`Falta ${file}`);
  }
}

const manifest = JSON.parse(fs.readFileSync('web/public/content/manifest.json', 'utf8'));
if (!manifest.some((entry) => entry.path === 'content/es/pasos.md')) {
  throw new Error('manifest.json no referencia content/es/pasos.md');
}

const html = fs.readFileSync('web/index.html', 'utf8');
const htmlSteps = [...html.matchAll(/step\((\d+),/g)].map((match) => Number(match[1]));
const markdown = fs.readFileSync('web/public/content/es/pasos.md', 'utf8');
const markdownSteps = [...markdown.matchAll(/^## Paso (\d+):/gm)].map((match) => Number(match[1]));
const notebook = fs.readFileSync('web/public/content/es/cuaderno-progreso.md', 'utf8');
const notebookSteps = [...notebook.matchAll(/^- \[ \] Paso (\d+):/gm)].map((match) => Number(match[1]));

function assertFullRoute(label, values) {
  const missing = [];
  for (let i = 1; i <= 45; i += 1) {
    if (!values.includes(i)) missing.push(i);
  }
  if (values.length !== 45 || missing.length) {
    throw new Error(`${label} debe tener 45 pasos. Encontrados=${values.length}, faltan=${missing.join(', ')}`);
  }
}

assertFullRoute('web/index.html', htmlSteps);
assertFullRoute('pasos.md', markdownSteps);
assertFullRoute('cuaderno-progreso.md', notebookSteps);

if (fs.existsSync('index.html') || fs.existsSync('academia-floci-simple.html')) {
  throw new Error('No debe haber HTML duplicado en la raiz. Usa web/index.html.');
}

console.log('Validacion OK: ruta simple, 45 pasos y manifest correctos.');
NODE
