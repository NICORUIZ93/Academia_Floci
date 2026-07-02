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
  'web/public/content/es/pasos.md',
  'examples/node/floci-example.js',
  'examples/python/floci-example.py',
  'examples/java/FlociS3Example.java',
  'examples/go/floci_s3_example.go',
  'examples/rust/floci_s3_example.rs',
  'scripts/validate-floci.sh',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    throw new Error(`Falta ${file}`);
  }
}

const html = fs.readFileSync('web/index.html', 'utf8');
const data = fs.readFileSync('web/app-data.js', 'utf8');
const app = fs.readFileSync('web/app.js', 'utf8');
const pasos = fs.readFileSync('web/public/content/es/pasos.md', 'utf8');
const compose = fs.readFileSync('docker-compose.yml', 'utf8');
const flociNode = fs.readFileSync('examples/node/floci-example.js', 'utf8');
const flociPython = fs.readFileSync('examples/python/floci-example.py', 'utf8');
const demoNode = fs.readFileSync('examples/node/demo.mjs', 'utf8');
const demoPython = fs.readFileSync('examples/python/demo.py', 'utf8');
const demoJava = fs.readFileSync('examples/java/FlociS3Example.java', 'utf8');
const demoGo = fs.readFileSync('examples/go/floci_s3_example.go', 'utf8');
const demoRust = fs.readFileSync('examples/rust/floci_s3_example.rs', 'utf8');
const flociScript = fs.readFileSync('scripts/validate-floci.sh', 'utf8');
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
  if (!lesson.explanation.includes('¿Por que es importante esto?') || !lesson.explanation.includes('¿Como se conecta con lo que ya aprendiste?')) {
    throw new Error(`La leccion ${lesson.number} debe empezar con contexto inicial`);
  }
  if (!['Principiante', 'Intermedio', 'Avanzado', 'Master'].includes(lesson.difficulty)) {
    throw new Error(`La leccion ${lesson.number} debe tener nivel Principiante, Intermedio, Avanzado o Master`);
  }
  if (!lesson.breakdown.some((item) => item.includes('Opciones y flags'))) {
    throw new Error(`La leccion ${lesson.number} debe desglosar opciones y flags`);
  }
  if (!lesson.resources.some((item) => item.includes('https://'))) {
    throw new Error(`La leccion ${lesson.number} debe incluir documentacion oficial`);
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

for (const expected of [
  'docker run -p 4566:4566 floci/floci:latest',
  'curl http://localhost:4566/_localstack/health',
  'aws configure set region us-east-1',
  'aws s3 ls --endpoint-url http://localhost:4566',
]) {
  if (!pasos.includes(expected)) {
    throw new Error(`pasos.md no contiene ${expected}`);
  }
}

for (const expected of [
  'floci/floci:latest',
  'floci/stackport:latest',
  'floci/floci-az:latest',
  'floci/floci-gcp:latest',
  '4566:4566',
  '4567:4567',
  '4577:4577',
  '4588:4588',
]) {
  if (!compose.includes(expected)) {
    throw new Error(`docker-compose.yml no contiene ${expected}`);
  }
}

if (!flociNode.includes("require('aws-sdk')") || !flociNode.includes('http://localhost:4566')) {
  throw new Error('examples/node/floci-example.js debe usar aws-sdk y endpoint Floci');
}

for (const expected of ['createBucket', 'putObject', 'getObject', 'deleteBucket', 'createQueue', 'sendMessage', 'receiveMessage', 'createTable', 'putItem', 'getItem', 'deleteTable']) {
  if (!flociNode.includes(expected)) {
    throw new Error(`examples/node/floci-example.js no contiene ${expected}`);
  }
}

if (!flociPython.includes('boto3.client') || !flociPython.includes('http://localhost:4566')) {
  throw new Error('examples/python/floci-example.py debe usar boto3 y endpoint Floci');
}

for (const expected of ['create_bucket', 'put_object', 'get_object', 'delete_bucket', 'create_queue', 'send_message', 'receive_message', 'create_table', 'put_item', 'get_item', 'delete_table']) {
  if (!flociPython.includes(expected)) {
    throw new Error(`examples/python/floci-example.py no contiene ${expected}`);
  }
}

if (!flociScript.includes('curl -s http://localhost:4566/_localstack/health') || !flociScript.includes('curl -s http://localhost:4577') || !flociScript.includes('curl -s http://localhost:4588') || !flociScript.includes('aws s3 ls --endpoint-url http://localhost:4566')) {
  throw new Error('scripts/validate-floci.sh debe validar AWS, Azure, GCP y AWS CLI');
}

for (const expected of ['Objetivo: practicar servicios', 'Floci escucha por defecto', 'S3 necesita forcePathStyle', 'publica un mensaje JSON']) {
  if (!demoNode.includes(expected)) {
    throw new Error(`examples/node/demo.mjs debe explicar: ${expected}`);
  }
}

for (const expected of ['practicar S3, SQS y DynamoDB', 'endpoint_url fuerza', 'put_object escribe', 'pruebas de observacion']) {
  if (!demoPython.includes(expected)) {
    throw new Error(`examples/python/demo.py debe explicar: ${expected}`);
  }
}

for (const expected of ['NoSuchBucket', 'ECONNREFUSED', 'SignatureDoesNotMatch']) {
  if (!demoNode.includes(expected)) {
    throw new Error(`examples/node/demo.mjs debe documentar el error: ${expected}`);
  }
}

for (const expected of ['NoSuchBucket', 'EndpointConnectionError', 'ResourceNotFoundException']) {
  if (!demoPython.includes(expected)) {
    throw new Error(`examples/python/demo.py debe documentar el error: ${expected}`);
  }
}

for (const [file, content] of [
  ['examples/java/FlociS3Example.java', demoJava],
  ['examples/go/floci_s3_example.go', demoGo],
  ['examples/rust/floci_s3_example.rs', demoRust],
]) {
  for (const expected of ['http://localhost:4566', 'curso-cloud-local', 'Fallo controlado']) {
    if (!content.includes(expected)) {
      throw new Error(`${file} debe contener ${expected}`);
    }
  }
}

if (!html.includes('id="floci-status"') || !app.includes('async function verificarFloci')) {
  throw new Error('La web debe incluir verificacion de Floci');
}

for (const expected of ['id="noteText"', 'id="saveNote"', 'id="difficultyBadge"', 'id="timeBadge"', 'diagram-card', 'class="mermaid"', 'service-icon', 'id="predictionText"', 'id="explanationText"', 'id="exerciseEvidence"', 'id="validateExercise"', 'id="exerciseStatus"', 'id="toggleNav"', 'id="toggleAllLessons"', 'id="fullOutlineDialog"', 'id="fullLessonList"', 'id="cloudLabDialog"', 'id="openCloudLab"']) {
  if (!html.includes(expected)) {
    throw new Error(`web/index.html no contiene ${expected}`);
  }
}

for (const expected of ['saveCurrentNote', 'highlightCommand', 'token-command', 'saveActiveResponse', 'isActiveResponseComplete', 'saveExerciseResponse', 'validateCurrentExercise', 'EXERCISE_KEY', 'toggleNavigation', 'NEARBY_LESSON_WINDOW = 2', 'renderFullOutline', 'openFullOutline', 'openCloudLab', '✅']) {
  if (!app.includes(expected)) {
    throw new Error(`web/app.js no contiene ${expected}`);
  }
}

for (const expected of ['@media (max-width: 760px)', 'body.nav-open .sidebar', '.mobile-nav-button', '.active-learning-panel', '.exercise-check-panel', 'position: sticky', 'bottom: 0', 'overflow-x: auto', 'white-space: pre', '.service-icons', '#16a34a', '.outline-dialog', '.full-course-lessons', '.cloud-dialog', '.topbar-actions']) {
  if (!fs.readFileSync('web/app.css', 'utf8').includes(expected)) {
    throw new Error(`web/app.css no contiene ${expected}`);
  }
}

const mainLessonHtml = html.slice(html.indexOf('<main class="lesson"'), html.indexOf('<div class="actions">'));
if (mainLessonHtml.includes('floci-status') || mainLessonHtml.includes('Diagramas Cloud') || mainLessonHtml.includes('Arquitectura Floci')) {
  throw new Error('La vista principal del curso no debe mezclar Floci/Cloud dentro de la leccion.');
}

for (const expected of ['flowchart LR', 'sequenceDiagram', 'AWS local :4566', 'Azure local :4577', 'GCP local :4588']) {
  if (!html.includes(expected)) {
    throw new Error(`web/index.html no contiene el diagrama Mermaid: ${expected}`);
  }
}

if (fs.existsSync('index.html') || fs.existsSync('academia-floci-simple.html')) {
  throw new Error('No debe haber HTML duplicado en la raiz. Usa web/index.html.');
}

console.log(`Validacion OK: app estatica, ${courses.length} modulos, ${fallbackSteps.length} lecciones, ${subtopicCount} subtemas aplicados.`);
NODE

python3 scripts/build_repo_graph.py --check
