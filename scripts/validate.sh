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
  'web/src/app/course/course-shell.html',
  'web/src/app/course/lesson-viewer.ts',
  'web/src/app/course/lesson-viewer.html',
  'web/src/app/course/lesson-viewer.scss',
  'web/src/app/course/lesson-index.html',
  'web/src/app/course/lab-verification.ts',
  'web/src/app/course/final-quiz.ts',
  'web/src/app/course/final-quiz.html',
  'web/src/app/content.service.ts',
  'web/src/app/theme.service.ts',
  'web/src/app/progress.service.ts',
  'web/src/app/course-data.ts',
  'web/src/app/course-module.model.ts',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    throw new Error(`Falta ${file}`);
  }
}

const html = fs.readFileSync('web/index.html', 'utf8');
// La app Angular se redisenio como lector tipo libro (commit 21d738b); las vistas
// guiadas de "study-page" ya no existen. Se valida la estructura actual:
// catalog/course-catalog, course/course-shell, course/lesson-viewer, course/lesson-index.
const angularCourseShellHtml = fs.readFileSync('web/src/app/course/course-shell.html', 'utf8');
const angularLessonViewerTs = fs.readFileSync('web/src/app/course/lesson-viewer.ts', 'utf8');
const angularLessonViewerHtml = fs.readFileSync('web/src/app/course/lesson-viewer.html', 'utf8');
const angularLessonViewerScss = fs.readFileSync('web/src/app/course/lesson-viewer.scss', 'utf8');
const angularLabVerification = fs.readFileSync('web/src/app/course/lab-verification.ts', 'utf8');
const angularFinalQuizTs = fs.readFileSync('web/src/app/course/final-quiz.ts', 'utf8');
const angularContentService = fs.readFileSync('web/src/app/content.service.ts', 'utf8');
const angularThemeService = fs.readFileSync('web/src/app/theme.service.ts', 'utf8');
const angularProgressService = fs.readFileSync('web/src/app/progress.service.ts', 'utf8');
const angularCourseData = fs.readFileSync('web/src/app/course-data.ts', 'utf8');
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
  if (!Array.isArray(lesson.quiz) || lesson.quiz.length < 3 || lesson.quiz.length > 5) {
    throw new Error(`La leccion ${lesson.number} debe incluir entre 3 y 5 preguntas interactivas`);
  }
  if (!lesson.exercise?.prompt || !lesson.exercise?.hint || lesson.exercise.minLength < 80) {
    throw new Error(`La leccion ${lesson.number} debe incluir ejercicio verificable y pista`);
  }
  if (!lesson.curiosity?.includes('¿Sabías que?')) {
    throw new Error(`La leccion ${lesson.number} debe incluir un dato escaneable`);
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
  'davireis/stackport:latest',
  'floci/floci-az:latest',
  'floci/floci-gcp:latest',
  '4566:4566',
  '8080:8080',
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

for (const expected of ['id="xpValue"', 'id="streakValue"', 'id="badgeValue"', 'id="timeValue"', 'id="quizQuestions"', 'id="quizFeedback"', 'id="badgesDialog"', 'id="feedbackToast"', 'id="curiosityText"', 'id="revealSolution"', 'id="solutionPanel"']) {
  if (!html.includes(expected)) throw new Error(`web/index.html no contiene experiencia interactiva: ${expected}`);
}

for (const expected of ['saveCurrentNote', 'highlightCommand', 'token-command', 'saveActiveResponse', 'isActiveResponseComplete', 'saveExerciseResponse', 'validateCurrentExercise', 'EXERCISE_KEY', 'toggleNavigation', 'NEARBY_LESSON_WINDOW = 2', 'renderFullOutline', 'openFullOutline', 'openCloudLab', '✅']) {
  if (!app.includes(expected)) {
    throw new Error(`web/app.js no contiene ${expected}`);
  }
}

for (const expected of ['GAMIFICATION', 'renderDashboard', 'renderQuiz', 'answerQuiz', 'showToast', 'xpPerLesson', 'xpPerModule', 'localDateKey', 'unlockedBadges']) {
  if (!app.includes(expected) && !data.includes(expected)) throw new Error(`Gamificación incompleta: falta ${expected}`);
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

// Modo claro/oscuro y buscador (paleta de comandos), visibles en la barra superior
// del lector tipo libro.
if (!angularThemeService.includes("localStorage") || !angularThemeService.includes('toggle')) {
  throw new Error('web/src/app/theme.service.ts debe persistir el tema en localStorage y exponer toggle()');
}
if (!angularCourseShellHtml.includes('paletteService.open()') || !angularCourseShellHtml.includes('themeService.toggle()')) {
  throw new Error('web/src/app/course/course-shell.html debe exponer buscador y modo claro/oscuro');
}
if (!angularProgressService.includes('localStorage') || !angularProgressService.includes('toggleModuleComplete')) {
  throw new Error('web/src/app/progress.service.ts debe guardar el progreso en localStorage');
}

// Diagramas Mermaid: el contenido markdown se re-empaqueta como <pre class="mermaid">
// y lesson-viewer.ts lo renderiza con mermaid.run() tras cada cambio de leccion.
if (!angularContentService.includes('mermaid') || !angularContentService.includes('language-mermaid')) {
  throw new Error('web/src/app/content.service.ts debe reempaquetar los bloques ```mermaid');
}
if (!angularLessonViewerTs.includes("from 'mermaid'") || !angularLessonViewerTs.includes('mermaid.run')) {
  throw new Error('web/src/app/course/lesson-viewer.ts debe renderizar diagramas Mermaid');
}
if (!angularLessonViewerScss.includes('::ng-deep') || !angularLessonViewerScss.includes('pre.mermaid')) {
  throw new Error('web/src/app/course/lesson-viewer.scss debe estilizar los diagramas Mermaid (con ::ng-deep, ya que el contenido se inserta via innerHTML)');
}

// Verificacion automatica de laboratorios: motor generico que se engancha a
// cualquier seccion "## Laboratorio practico" con parrafo "Verificacion:".
if (!angularLessonViewerTs.includes('applyLabVerification')) {
  throw new Error('web/src/app/course/lesson-viewer.ts debe invocar applyLabVerification');
}
for (const expected of ['Verificación', 'lab-verify', 'Verificar', 'Incorrecto', 'Correcto']) {
  if (!angularLabVerification.includes(expected)) {
    throw new Error(`web/src/app/course/lab-verification.ts no contiene ${expected}`);
  }
}
if (!angularLessonViewerScss.includes('.lab-verify')) {
  throw new Error('web/src/app/course/lesson-viewer.scss debe estilizar el widget .lab-verify');
}

// Cuestionario final: 10 preguntas por track, ruta /curso/:trackId/quiz.
for (const expected of ['readonly score', 'submit(): void', 'allAnswered']) {
  if (!angularFinalQuizTs.includes(expected)) {
    throw new Error(`web/src/app/course/final-quiz.ts no contiene ${expected}`);
  }
}

if (fs.existsSync('index.html') || fs.existsSync('academia-floci-simple.html')) {
  throw new Error('No debe haber HTML duplicado en la raiz. Usa web/index.html.');
}

// ── App Angular (tracks universitarios) ──────────────────────────────────────
// Por cada track real, el numero de archivos web/public/content/<track>/modulo-*.md
// debe coincidir exactamente con el numero de modulos definidos en su fuente
// TypeScript (cada uno declarado como m(<numero>, ...)), para detectar contenido
// huerfano o modulos sin redactar.
const TRACK_SOURCES = {
  foundations: 'web/src/app/tracks/foundations.track.ts',
  cloud: 'web/src/app/course-data.ts',
  devops: 'web/src/app/tracks/devops.track.ts',
  javascript: 'web/src/app/tracks/javascript.track.ts',
  node: 'web/src/app/tracks/node.track.ts',
  angular: 'web/src/app/tracks/angular.track.ts',
  react: 'web/src/app/tracks/react.track.ts',
  java: 'web/src/app/tracks/java.track.ts',
  'spring-boot': 'web/src/app/tracks/spring-boot.track.ts',
  'kotlin-multiplatform': 'web/src/app/tracks/kotlin-multiplatform.track.ts',
  android: 'web/src/app/tracks/android.track.ts',
  ios: 'web/src/app/tracks/ios.track.ts',
  flutter: 'web/src/app/tracks/flutter.track.ts',
  rutaflow: 'web/src/app/tracks/rutaflow.track.ts',
};

const trackIdsInData = [...angularCourseData.matchAll(/id:\s*'([a-z-]+)'/g)].map((m) => m[1]);
for (const trackId of Object.keys(TRACK_SOURCES)) {
  if (!trackIdsInData.includes(trackId)) {
    throw new Error(`web/src/app/course-data.ts no registra el track '${trackId}' en TRACKS`);
  }
}
if (trackIdsInData.length !== Object.keys(TRACK_SOURCES).length) {
  throw new Error(`TRACKS debe tener ${Object.keys(TRACK_SOURCES).length} tracks. Encontrados=${trackIdsInData.length}`);
}

for (const [trackId, sourceFile] of Object.entries(TRACK_SOURCES)) {
  const source = fs.readFileSync(sourceFile, 'utf8');
  const definedModules = (source.match(/^\s*m\(\d+,/gm) || []).length;
  const contentDir = `web/public/content/${trackId}`;
  const moduleFiles = fs.existsSync(contentDir)
    ? fs.readdirSync(contentDir).filter((f) => /^modulo-\d+\.md$/.test(f)).length
    : 0;
  if (definedModules === 0) {
    throw new Error(`${sourceFile} no define ningun modulo m(...)`);
  }
  if (moduleFiles !== definedModules) {
    throw new Error(`El track '${trackId}' define ${definedModules} modulos en ${sourceFile} pero tiene ${moduleFiles} archivos en ${contentDir}/`);
  }
  for (const [heading, required] of [
    ['## Sílabo', true],
    ['## Contenido teórico', true],
    ['## Resumen del módulo', true],
  ]) {
    const missing = [];
    for (let i = 0; i < moduleFiles; i += 1) {
      const file = `${contentDir}/modulo-${i}.md`;
      if (!fs.existsSync(file)) { missing.push(i); continue; }
      const content = fs.readFileSync(file, 'utf8');
      if (!content.includes(heading)) missing.push(i);
    }
    if (missing.length) {
      throw new Error(`Track '${trackId}': faltan modulos sin '${heading}': ${missing.join(', ')}`);
    }
  }
}

// Cuestionario final: 10 preguntas por track.
const TRACK_QUIZ_NAMES = {
  foundations: 'FOUNDATIONS_QUIZ',
  cloud: 'CLOUD_QUIZ',
  devops: 'DEVOPS_QUIZ',
  javascript: 'JAVASCRIPT_QUIZ',
  node: 'NODE_QUIZ',
  angular: 'ANGULAR_QUIZ',
  react: 'REACT_QUIZ',
  java: 'JAVA_QUIZ',
  'spring-boot': 'SPRING_BOOT_QUIZ',
  'kotlin-multiplatform': 'KOTLIN_MULTIPLATFORM_QUIZ',
  android: 'ANDROID_QUIZ',
  ios: 'IOS_QUIZ',
  flutter: 'FLUTTER_QUIZ',
  rutaflow: 'RUTAFLOW_QUIZ',
};

let totalQuizQuestions = 0;
for (const [trackId, quizName] of Object.entries(TRACK_QUIZ_NAMES)) {
  if (!angularCourseData.includes(`quiz: ${quizName}`)) {
    throw new Error(`El track '${trackId}' no tiene 'quiz: ${quizName}' asignado en TRACKS`);
  }
  const re = new RegExp(`export const ${quizName}: QuizQuestion\\[\\] = \\[([\\s\\S]*?)\\n\\];`);
  const match = angularCourseData.match(re);
  if (!match) {
    throw new Error(`No se encontro la declaracion de ${quizName} en web/src/app/course-data.ts`);
  }
  const questionCount = (match[1].match(/\{\s*question:/g) || []).length;
  if (questionCount !== 10) {
    throw new Error(`${quizName} debe tener 10 preguntas. Encontradas=${questionCount}`);
  }
  totalQuizQuestions += questionCount;
}

// Los 3 diagramas Mermaid pedidos (arquitectura, flujo de peticion, comparativa)
// deben existir en el contenido real del track Cloud.
const cloudModulo0 = fs.readFileSync('web/public/content/cloud/modulo-0.md', 'utf8');
const cloudModulo6 = fs.readFileSync('web/public/content/cloud/modulo-6.md', 'utf8');
const cloudModulo8 = fs.readFileSync('web/public/content/cloud/modulo-8.md', 'utf8');
if (!cloudModulo0.includes('```mermaid') || !cloudModulo0.includes('flowchart')) {
  throw new Error('cloud/modulo-0.md debe incluir el diagrama Mermaid de arquitectura de Floci');
}
if (!cloudModulo6.includes('```mermaid') || !cloudModulo6.includes('sequenceDiagram')) {
  throw new Error('cloud/modulo-6.md debe incluir el diagrama Mermaid de flujo de peticion');
}
if (!cloudModulo8.includes('| Categoría | AWS | Azure | GCP |')) {
  throw new Error('cloud/modulo-8.md debe incluir la tabla comparativa AWS vs Azure vs GCP');
}

console.log(`Validacion OK: app estatica, ${courses.length} modulos, ${fallbackSteps.length} lecciones, ${subtopicCount} subtemas aplicados.`);
console.log(`Validacion OK: app Angular, ${trackIdsInData.length} tracks, ${totalQuizQuestions} preguntas de cuestionario final.`);
NODE

python3 scripts/validate_pedagogy.py
python3 scripts/validate_curriculum.py
python3 scripts/validate_official_sources.py
python3 scripts/validate_code_quality.py
python3 scripts/validate_rutaflow.py
python3 scripts/validate_requested_master_topics.py
python3 scripts/validate_definitive_topics.py
python3 scripts/validate_supplemental_topics.py
python3 scripts/validate_requested_practical_examples.py
python3 scripts/audit_topic_learning_quality.py --check
python3 scripts/build_web_topic_index.py --check
python3 scripts/build_repo_graph.py --check
