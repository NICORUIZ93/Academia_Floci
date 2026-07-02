#!/usr/bin/env sh
set -eu

ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$ROOT"

node <<'NODE'
const fs = require('fs');
const vm = require('vm');

const requiredFiles = [
  'README.md',
  'docker-compose.yml',
  '.env.example',
  'web/index.html',
  'web/app.css',
  'web/app-data.js',
  'web/app.js',
  'web/README.md',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    throw new Error(`Falta ${file}`);
  }
}

const html = fs.readFileSync('web/index.html', 'utf8');
const data = fs.readFileSync('web/app-data.js', 'utf8');
const app = fs.readFileSync('web/app.js', 'utf8');
const linksAssets = html.includes('href="app.css"')
  && html.includes('src="app-data.js"')
  && html.includes('src="app.js"');

const { courseBlueprints, courses, fallbackSteps, method } = vm.runInNewContext(`${data}
({
  courseBlueprints: COURSE_BLUEPRINTS,
  courses,
  fallbackSteps,
  method: METHOD,
})`);

function assertFullRoute(label, values) {
  const missing = [];
  for (let i = 1; i <= values.length; i += 1) {
    if (!values.includes(i)) missing.push(i);
  }
  if (missing.length) {
    throw new Error(`${label} debe tener pasos consecutivos. Encontrados=${values.length}, faltan=${missing.join(', ')}`);
  }
}

assertFullRoute('web/app-data.js', fallbackSteps.map((step) => step.number));

if (courses.length !== 8) {
  throw new Error(`web/app-data.js debe tener 8 modulos. Encontrados=${courses.length}`);
}

if (fallbackSteps.length < 150) {
  throw new Error(`El curriculo debe tener al menos 150 lecciones. Encontradas=${fallbackSteps.length}`);
}

const subtopicCount = courseBlueprints.reduce(
  (sum, course) => sum + course.levels.reduce(
    (levelSum, level) => levelSum + level.topics.reduce(
      (topicSum, topic) => topicSum + topic.subtopics.length,
      0,
    ),
    0,
  ),
  0,
);
if (subtopicCount < 900) {
  throw new Error(`El curriculo debe aplicar al menos 900 subtemas. Encontrados=${subtopicCount}`);
}

if (method.length !== 7) {
  throw new Error(`La metodologia debe tener 7 pasos. Encontrados=${method.length}`);
}

for (const lesson of fallbackSteps) {
  const required = ['objective', 'theory', 'command', 'deepDive', 'challenge', 'output'];
  for (const field of required) {
    if (!lesson[field]) {
      throw new Error(`La leccion ${lesson.number} no tiene ${field}`);
    }
  }
  if (!Array.isArray(lesson.commonErrors) || lesson.commonErrors.length < 3) {
    throw new Error(`La leccion ${lesson.number} debe tener errores comunes`);
  }
  if (!Array.isArray(lesson.resources) || lesson.resources.length < 3) {
    throw new Error(`La leccion ${lesson.number} debe tener recursos`);
  }
}

for (const course of courses) {
  const courseSteps = fallbackSteps.filter((step) => step.number >= course.start && step.number <= course.end);
  if (!courseSteps.length) {
    throw new Error(`El modulo ${course.title} no tiene lecciones`);
  }
}

if (!linksAssets) {
  throw new Error('web/index.html debe enlazar app.css, app-data.js y app.js');
}

if (!app.includes('sourceStatus') || !app.includes('completeCurrentStep') || !app.includes('renderMethod')) {
  throw new Error('web/app.js debe manejar estado, progreso y metodologia');
}

if (fs.existsSync('index.html') || fs.existsSync('academia-floci-simple.html')) {
  throw new Error('No debe haber HTML duplicado en la raiz. Usa web/index.html.');
}

console.log(`Validacion OK: app estatica, ${courses.length} modulos, ${fallbackSteps.length} lecciones, ${subtopicCount} subtemas aplicados.`);
NODE

python3 scripts/build_repo_graph.py --check
