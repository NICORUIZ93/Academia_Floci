let steps = fallbackSteps;
let progressStep = readProgress();
let viewStep = Math.min(progressStep, steps.length);
const NOTES_KEY = "academia-master-notes";

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
  expectedOutput: $("expectedOutput"),
  resourcesList: $("resourcesList"),
  controlQuestion: $("controlQuestion"),
  lessonList: $("lessonList"),
  outlineTitle: $("outlineTitle"),
  progressLabel: $("progressLabel"),
  progressBar: $("progressBar"),
  sourceStatus: $("sourceStatus"),
  previousStep: $("previousStep"),
  nextStep: $("nextStep"),
  completeStep: $("completeStep"),
  flociStatus: $("floci-status"),
  noteText: $("noteText"),
  noteStatus: $("noteStatus"),
  saveNote: $("saveNote"),
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

function renderLessons(currentCourse) {
  elements.outlineTitle.textContent = `Temario: ${currentCourse.title}`;
  elements.lessonList.replaceChildren();

  stepsForCourse(currentCourse).forEach((item) => {
    const li = document.createElement("li");
    const button = document.createElement("button");
    const marker = document.createElement("span");
    const label = document.createElement("span");

    button.type = "button";
    if (item.number === viewStep) button.classList.add("is-active");
    if (item.number < progressStep) button.classList.add("is-complete");
    marker.textContent = item.number < progressStep ? "✓" : item.number === viewStep ? "●" : "○";
    label.textContent = `Paso ${item.number}: ${item.title}`;

    button.append(marker, label);
    button.addEventListener("click", () => showStep(item.number));
    li.appendChild(button);
    elements.lessonList.appendChild(li);
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

render();
elements.sourceStatus.textContent = `${courses.length} modulos · ${steps.length} lecciones generadas.`;
verificarFloci();
