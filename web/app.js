let steps = fallbackSteps;
let progressStep = readProgress();
let viewStep = Math.min(progressStep, steps.length);
const NOTES_KEY = "academia-master-notes";
const ACTIVE_KEY = "academia-master-active-learning";
const EXERCISE_KEY = "academia-master-exercise-evidence";
const NEARBY_LESSON_WINDOW = 2;

const $ = (id) => document.getElementById(id);

const elements = {
  courseList: $("courseList"),
  courseLabel: $("courseLabel"),
  difficultyBadge: $("difficultyBadge"),
  timeBadge: $("timeBadge"),
  lessonTitle: $("lessonTitle"),
  lessonText: $("lessonText"),
  lessonHint: $("lessonHint"),
  objectiveText: $("objectiveText"),
  theoryText: $("theoryText"),
  commandPanel: $("commandPanel"),
  commandText: $("commandText"),
  copyStatus: $("copyStatus"),
  breakdownList: $("breakdownList"),
  deepDiveText: $("deepDiveText"),
  errorsList: $("errorsList"),
  challengeText: $("challengeText"),
  exerciseEvidence: $("exerciseEvidence"),
  exerciseStatus: $("exerciseStatus"),
  validateExercise: $("validateExercise"),
  expectedOutput: $("expectedOutput"),
  resourcesList: $("resourcesList"),
  controlQuestion: $("controlQuestion"),
  lessonList: $("lessonList"),
  fullOutlineDialog: $("fullOutlineDialog"),
  fullLessonList: $("fullLessonList"),
  cloudLabDialog: $("cloudLabDialog"),
  outlineTitle: $("outlineTitle"),
  progressLabel: $("progressLabel"),
  progressBar: $("progressBar"),
  sourceStatus: $("sourceStatus"),
  toggleAllLessons: $("toggleAllLessons"),
  closeFullOutline: $("closeFullOutline"),
  openCloudLab: $("openCloudLab"),
  closeCloudLab: $("closeCloudLab"),
  toggleNav: $("toggleNav"),
  closeNav: $("closeNav"),
  previousStep: $("previousStep"),
  nextStep: $("nextStep"),
  completeStep: $("completeStep"),
  flociStatus: $("floci-status"),
  noteText: $("noteText"),
  noteStatus: $("noteStatus"),
  saveNote: $("saveNote"),
  predictionText: $("predictionText"),
  explanationText: $("explanationText"),
  activeStatus: $("activeStatus"),
};

// Cambio P2: verificacion visual del laboratorio local desde la interfaz.
async function verificarFloci() {
  if (!elements.flociStatus) return;

  elements.flociStatus.textContent = "Verificando Floci...";

  try {
    const response = await fetch("http://localhost:4566/_localstack/health");
    if (response.ok) {
      const data = await response.json();
      const services = data.services ? Object.keys(data.services).join(", ") : "servicios disponibles";
      elements.flociStatus.textContent = `Floci funcionando: ${services}`;
    } else {
      elements.flociStatus.textContent = "Floci no responde";
    }
  } catch {
    elements.flociStatus.textContent = "No se puede conectar. Ejecuta: docker compose up -d";
  }
}

window.verificarFloci = verificarFloci;

function readProgress() {
  const saved = Number(localStorage.getItem(STORAGE_KEY));
  if (!Number.isInteger(saved) || saved < 1) return 1;
  return Math.min(saved, fallbackSteps.length + 1);
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, String(progressStep));
}

// Cambio P1: notas del cuaderno persistidas por numero de paso.
function readNotes() {
  try {
    return JSON.parse(localStorage.getItem(NOTES_KEY)) || {};
  } catch {
    return {};
  }
}

function saveNotes(notes) {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

function readActiveResponses() {
  try {
    return JSON.parse(localStorage.getItem(ACTIVE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveActiveResponses(responses) {
  localStorage.setItem(ACTIVE_KEY, JSON.stringify(responses));
}

function readExerciseEvidence() {
  try {
    return JSON.parse(localStorage.getItem(EXERCISE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveExerciseEvidence(evidence) {
  localStorage.setItem(EXERCISE_KEY, JSON.stringify(evidence));
}

function courseForStep(stepNumber) {
  return courses.find((course) => stepNumber >= course.start && stepNumber <= course.end) || courses[0];
}

function stepsForCourse(course) {
  return steps.filter((item) => item.number >= course.start && item.number <= course.end);
}

function completedInCourse(course) {
  return stepsForCourse(course).filter((item) => item.number < progressStep).length;
}

function firstUsefulStep(course) {
  const pending = stepsForCourse(course).find((item) => item.number >= progressStep);
  return pending ? pending.number : course.start;
}

function currentStep() {
  return steps[viewStep - 1] || steps[0];
}

function render() {
  const current = currentStep();
  const currentCourse = courseForStep(current.number);
  const courseSteps = stepsForCourse(currentCourse);
  const courseIndex = courses.indexOf(currentCourse) + 1;
  const lessonIndex = courseSteps.findIndex((item) => item.number === current.number) + 1;
  const completedCount = Math.min(progressStep - 1, steps.length);

  elements.progressLabel.textContent = `${completedCount}/${steps.length} completados`;
  elements.progressBar.value = completedCount;
  elements.progressBar.max = steps.length;
  elements.courseLabel.textContent = `Curso ${courseIndex}: ${currentCourse.title} · Lección ${lessonIndex} de ${courseSteps.length}`;
  elements.difficultyBadge.textContent = `Nivel: ${current.difficulty || "General"}`;
  elements.timeBadge.textContent = `Tiempo: ${current.estimatedTime || "10 min"}`;
  elements.lessonTitle.textContent = `Paso ${current.number}: ${current.title}`;
  elements.lessonText.textContent = current.explanation;
  elements.lessonHint.textContent = current.command
    ? "Haz la practica, escribe una nota corta y marca la leccion cuando puedas explicarla."
    : "Lee el concepto y explicalo con tus palabras antes de avanzar.";

  renderCommand(current);
  renderMethod(current);
  renderCourses(currentCourse);
  renderLessons(currentCourse);
  renderNote(current);
  renderActiveResponses(current);
  renderExerciseEvidence(current);
  renderActions();
}

function renderCommand(current) {
  elements.copyStatus.textContent = "";
  elements.expectedOutput.textContent = current.output;
  elements.objectiveText.textContent = current.objective;
  elements.theoryText.textContent = current.theory;
  elements.deepDiveText.textContent = current.deepDive;
  elements.challengeText.textContent = current.challenge;
  elements.controlQuestion.textContent = current.command
    ? "¿Como aplicarias esta idea en un proyecto real?"
    : "Explica este concepto con tus palabras.";

  if (!current.command) {
    elements.commandPanel.classList.add("hidden");
    elements.commandText.textContent = "";
    return;
  }

  elements.commandPanel.classList.remove("hidden");
  elements.commandText.innerHTML = highlightCommand(current.command);
}

// Cambio P2: resaltado ligero sin dependencias externas.
function highlightCommand(command) {
  return escapeHtml(command)
    .replace(/\b(docker|aws|curl|python3?|node|npm|git|kubectl|terraform)\b/g, '<span class="token-command">$1</span>')
    .replace(/(--[a-zA-Z0-9-]+)/g, '<span class="token-option">$1</span>')
    .replace(/(http:\/\/[^\s]+)/g, '<span class="token-url">$1</span>');
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderMethod(current) {
  elements.breakdownList.replaceChildren();
  current.breakdown.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    elements.breakdownList.appendChild(li);
  });

  elements.errorsList.replaceChildren();
  current.commonErrors.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    elements.errorsList.appendChild(li);
  });

  elements.resourcesList.replaceChildren();
  current.resources.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    elements.resourcesList.appendChild(li);
  });
}

function renderCourses(currentCourse) {
  elements.courseList.replaceChildren();

  courses.forEach((course) => {
    const total = course.end - course.start + 1;
    const completed = completedInCourse(course);
    const button = document.createElement("button");
    const code = document.createElement("span");
    const body = document.createElement("span");
    const name = document.createElement("span");
    const meta = document.createElement("span");

    button.type = "button";
    button.className = "course-card";
    if (course.id === currentCourse.id) button.classList.add("is-active");
    if (completed === total) button.classList.add("is-complete");

    code.className = "course-code";
    code.textContent = course.code;
    name.className = "course-name";
    name.textContent = course.title;
    meta.className = "course-meta";
    meta.textContent = `${course.description} · ${Math.round((completed / total) * 100)}% · ${completed}/${total}`;

    body.append(name, meta);
    button.append(code, body);
    button.addEventListener("click", () => showStep(firstUsefulStep(course)));
    elements.courseList.appendChild(button);
  });
}

function renderNote(current) {
  const notes = readNotes();
  elements.noteText.value = notes[current.number] || "";
  elements.noteStatus.textContent = notes[current.number] ? "Nota guardada para este paso." : "Sin nota guardada.";
}

function renderActiveResponses(current) {
  const responses = readActiveResponses();
  const currentResponses = responses[current.number] || {};
  elements.predictionText.value = currentResponses.prediction || "";
  elements.explanationText.value = currentResponses.explanation || "";
  elements.activeStatus.textContent = isActiveResponseComplete(current.number)
    ? "Prediccion y explicacion guardadas."
    : "Completa prediccion y explicacion para marcar el paso como aprendido.";
}

function renderExerciseEvidence(current) {
  const evidence = readExerciseEvidence();
  elements.exerciseEvidence.value = evidence[current.number] || "";
  elements.exerciseStatus.textContent = evidence[current.number]
    ? "Evidencia guardada. Puedes volver a validar cuando actualices tu practica."
    : "Pega una evidencia antes de validar el ejercicio.";
}

function isActiveResponseComplete(stepNumber) {
  const responses = readActiveResponses()[stepNumber] || {};
  return Boolean(responses.prediction?.trim() && responses.explanation?.trim());
}

function renderLessons(currentCourse) {
  elements.outlineTitle.textContent = `Temario: ${currentCourse.title}`;
  elements.lessonList.replaceChildren();

  const courseLessons = stepsForCourse(currentCourse);
  const visibleLessons = courseLessons.filter((item) => Math.abs(item.number - viewStep) <= NEARBY_LESSON_WINDOW);

  elements.toggleAllLessons.textContent = "Temario completo";

  visibleLessons.forEach((item) => {
    const li = document.createElement("li");
    const button = document.createElement("button");
    const marker = document.createElement("span");
    const label = document.createElement("span");

    button.type = "button";
    if (item.number === viewStep) button.classList.add("is-active");
    if (item.number < progressStep) button.classList.add("is-complete");
    marker.textContent = item.number < progressStep ? "✅" : item.number === viewStep ? "●" : "○";
    label.textContent = `Paso ${item.number}: ${item.title}`;

    button.append(marker, label);
    button.addEventListener("click", () => showStep(item.number));
    li.appendChild(button);
    elements.lessonList.appendChild(li);
  });

  if (visibleLessons.length < courseLessons.length) {
    const li = document.createElement("li");
    li.className = "lesson-list-hint";
    li.textContent = `Mostrando ${visibleLessons.length} pasos cercanos de ${courseLessons.length}.`;
    elements.lessonList.appendChild(li);
  }
}

function renderFullOutline() {
  elements.fullLessonList.replaceChildren();

  courses.forEach((course) => {
    const courseItem = document.createElement("li");
    const title = document.createElement("h3");
    const list = document.createElement("ol");

    courseItem.className = "full-course-group";
    title.textContent = `${course.code} · ${course.title}`;
    list.className = "full-course-lessons";

    stepsForCourse(course).forEach((item) => {
      const li = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = `${item.number < progressStep ? "✅ " : ""}Paso ${item.number}: ${item.title}`;
      if (item.number === viewStep) button.classList.add("is-active");
      if (item.number < progressStep) button.classList.add("is-complete");
      button.addEventListener("click", () => {
        elements.fullOutlineDialog.close();
        showStep(item.number);
      });
      li.appendChild(button);
      list.appendChild(li);
    });

    courseItem.append(title, list);
    elements.fullLessonList.appendChild(courseItem);
  });
}

function renderActions() {
  elements.previousStep.disabled = viewStep === 1;
  elements.nextStep.disabled = viewStep === steps.length;
  elements.completeStep.disabled = progressStep > steps.length && viewStep === steps.length;
  elements.completeStep.textContent = progressStep > steps.length && viewStep === steps.length
    ? "Ruta completada"
    : "Marcar completado";
}

function showStep(number) {
  viewStep = Math.min(Math.max(1, number), steps.length);
  render();
  document.querySelector(".lesson").focus({ preventScroll: true });
  scrollTo({ top: 0, behavior: "smooth" });
}

function completeCurrentStep() {
  if (!isActiveResponseComplete(viewStep)) {
    elements.activeStatus.textContent = "Antes de completar: escribe tu prediccion y tu explicacion.";
    elements.predictionText.focus();
    return;
  }

  if (viewStep >= progressStep) {
    progressStep = Math.min(viewStep + 1, steps.length + 1);
    saveProgress();
  }
  showStep(Math.min(viewStep + 1, steps.length));
}

// Cambio P1: guardar o eliminar la nota del paso actual.
function saveCurrentNote() {
  const notes = readNotes();
  const value = elements.noteText.value.trim();
  if (value) {
    notes[viewStep] = value;
  } else {
    delete notes[viewStep];
  }
  saveNotes(notes);
  elements.noteStatus.textContent = value ? "Nota guardada." : "Nota eliminada.";
}

function saveActiveResponse() {
  const responses = readActiveResponses();
  responses[viewStep] = {
    prediction: elements.predictionText.value.trim(),
    explanation: elements.explanationText.value.trim(),
  };
  saveActiveResponses(responses);
  elements.activeStatus.textContent = isActiveResponseComplete(viewStep)
    ? "Prediccion y explicacion guardadas."
    : "Completa ambos campos para marcar el paso como aprendido.";
}

function saveExerciseResponse() {
  const evidence = readExerciseEvidence();
  const value = elements.exerciseEvidence.value.trim();
  if (value) {
    evidence[viewStep] = value;
  } else {
    delete evidence[viewStep];
  }
  saveExerciseEvidence(evidence);
  elements.exerciseStatus.textContent = value ? "Evidencia guardada." : "Evidencia eliminada.";
}

function validateCurrentExercise() {
  const current = currentStep();
  const evidence = elements.exerciseEvidence.value.trim();
  const hasActiveReflection = isActiveResponseComplete(viewStep);
  const expectedTokens = current.title
    .toLowerCase()
    .split(/[^a-z0-9áéíóúñ]+/i)
    .filter((token) => token.length > 4)
    .slice(0, 3);
  const mentionsTopic = expectedTokens.length === 0
    || expectedTokens.some((token) => evidence.toLowerCase().includes(token));

  if (evidence.length < 80) {
    elements.exerciseStatus.textContent = "Validacion incompleta: agrega al menos 80 caracteres de evidencia concreta.";
    elements.exerciseEvidence.focus();
    return;
  }

  if (!mentionsTopic) {
    elements.exerciseStatus.textContent = "Validacion incompleta: menciona el concepto del paso o el resultado observado.";
    elements.exerciseEvidence.focus();
    return;
  }

  if (!hasActiveReflection) {
    elements.exerciseStatus.textContent = "Validacion incompleta: completa tambien prediccion y explicacion.";
    elements.predictionText.focus();
    return;
  }

  saveExerciseResponse();
  elements.exerciseStatus.textContent = "Ejercicio validado: tienes evidencia, relacion con el tema y reflexion activa.";
}

function toggleNavigation(open) {
  document.body.classList.toggle("nav-open", open);
  elements.toggleNav.setAttribute("aria-expanded", String(open));
}

function openFullOutline() {
  renderFullOutline();
  if (typeof elements.fullOutlineDialog.showModal === "function") {
    elements.fullOutlineDialog.showModal();
  } else {
    elements.fullOutlineDialog.setAttribute("open", "");
  }
}

function openCloudLab() {
  if (typeof elements.cloudLabDialog.showModal === "function") {
    elements.cloudLabDialog.showModal();
  } else {
    elements.cloudLabDialog.setAttribute("open", "");
  }
}

function resetProgress() {
  progressStep = 1;
  viewStep = 1;
  saveProgress();
  render();
}

async function copyCommand() {
  const command = currentStep().command;
  if (!command) return;

  try {
    await navigator.clipboard.writeText(command);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = command;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }

  elements.copyStatus.textContent = "Practica copiada.";
}

$("copyCommand").addEventListener("click", copyCommand);
$("completeStep").addEventListener("click", completeCurrentStep);
$("previousStep").addEventListener("click", () => showStep(viewStep - 1));
$("nextStep").addEventListener("click", () => showStep(viewStep + 1));
$("resetProgress").addEventListener("click", resetProgress);
$("saveNote").addEventListener("click", saveCurrentNote);
$("predictionText").addEventListener("input", saveActiveResponse);
$("explanationText").addEventListener("input", saveActiveResponse);
$("exerciseEvidence").addEventListener("input", saveExerciseResponse);
$("validateExercise").addEventListener("click", validateCurrentExercise);
$("toggleAllLessons").addEventListener("click", openFullOutline);
$("closeFullOutline").addEventListener("click", () => elements.fullOutlineDialog.close());
$("openCloudLab").addEventListener("click", openCloudLab);
$("closeCloudLab").addEventListener("click", () => elements.cloudLabDialog.close());
$("toggleNav").addEventListener("click", () => toggleNavigation(!document.body.classList.contains("nav-open")));
$("closeNav").addEventListener("click", () => toggleNavigation(false));

render();
elements.sourceStatus.textContent = `${courses.length} modulos · ${steps.length} lecciones generadas.`;
