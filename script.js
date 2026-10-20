const STORAGE_KEY = "studyScheduleMaker";

let subjects = [];
let doneBlocks = {}; // index -> true

const $ = (id) => document.getElementById(id);
const priorityLabel = { 1: "High", 2: "Medium", 3: "Low" };

function save() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      subjects,
      doneBlocks,
      startTime: $("startTime").value,
      breakMin: $("breakMin").value,
    })
  );
}

function load() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!data) return;
    subjects = data.subjects || [];
    doneBlocks = data.doneBlocks || {};
    if (data.startTime) $("startTime").value = data.startTime;
    if (data.breakMin !== undefined) $("breakMin").value = data.breakMin;
  } catch (e) {
    /* ignore corrupted storage */
  }
}

function renderSubjects() {
  const list = $("subjectList");
  list.innerHTML = "";
  subjects.forEach((s, i) => {
    const li = document.createElement("li");
    const info = document.createElement("span");
    info.textContent = `${s.name} - ${s.minutes} min`;
    const badge = document.createElement("span");
    badge.className = `badge p${s.priority}`;
    badge.textContent = priorityLabel[s.priority];
    info.appendChild(badge);

    const remove = document.createElement("button");
    remove.className = "remove";
    remove.textContent = "×";
    remove.title = "Remove";
    remove.addEventListener("click", () => {
      subjects.splice(i, 1);
      doneBlocks = {};
      save();
      renderSubjects();
      generate();
    });

    li.append(info, remove);
    list.appendChild(li);
  });
}

function toMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

function formatTime(totalMin) {
  const mins = ((totalMin % 1440) + 1440) % 1440;
  const h24 = Math.floor(mins / 60);
  const m = mins % 60;
  const suffix = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

// Returns an array of blocks: { start, end, label, type }
function buildSchedule() {
  const breakMin = Math.max(0, parseInt($("breakMin").value, 10) || 0);
  let cursor = toMinutes($("startTime").value || "18:00");

  // High priority first; keep the order the user added within the same priority
  const ordered = subjects
    .map((s, idx) => ({ ...s, idx }))
    .sort((a, b) => a.priority - b.priority || a.idx - b.idx);

  const blocks = [];
  ordered.forEach((s, i) => {
    blocks.push({ start: cursor, end: cursor + s.minutes, label: s.name, type: "study" });
    cursor += s.minutes;
    if (breakMin > 0 && i < ordered.length - 1) {
      blocks.push({ start: cursor, end: cursor + breakMin, label: "Break", type: "break" });
      cursor += breakMin;
    }
  });
  return blocks;
}

function generate() {
  const tbody = document.querySelector("#scheduleTable tbody");
  tbody.innerHTML = "";
  const blocks = buildSchedule();

  if (blocks.length === 0) {
    $("summary").textContent = "Add at least one subject to generate a schedule.";
    return;
  }

  blocks.forEach((b, i) => {
    const tr = document.createElement("tr");
    if (b.type === "break") tr.className = "break";
    if (doneBlocks[i]) tr.classList.add("done");

    const timeTd = document.createElement("td");
    timeTd.textContent = `${formatTime(b.start)} - ${formatTime(b.end)}`;

    const labelTd = document.createElement("td");
    labelTd.textContent = b.label;

    const doneTd = document.createElement("td");
    if (b.type === "study") {
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = !!doneBlocks[i];
      cb.addEventListener("change", () => {
        doneBlocks[i] = cb.checked;
        tr.classList.toggle("done", cb.checked);
        save();
      });
      doneTd.appendChild(cb);
    }

    tr.append(timeTd, labelTd, doneTd);
    tbody.appendChild(tr);
  });

  const studyTotal = subjects.reduce((sum, s) => sum + s.minutes, 0);
  const hours = (studyTotal / 60).toFixed(1);
  $("summary").textContent =
    `${subjects.length} subject(s), ${hours} h of study. Ends around ${formatTime(blocks[blocks.length - 1].end)}.`;
  save();
}

function scheduleAsText() {
  return buildSchedule()
    .map((b) => `${formatTime(b.start)} - ${formatTime(b.end)}  ${b.label}`)
    .join("\n");
}

$("subjectForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $("subjectName").value.trim();
  const minutes = parseInt($("subjectMin").value, 10);
  const priority = parseInt($("subjectPriority").value, 10);
  if (!name || !minutes) return;

  subjects.push({ name, minutes, priority });
  doneBlocks = {};
  $("subjectName").value = "";
  save();
  renderSubjects();
  generate();
});

$("generateBtn").addEventListener("click", () => {
  doneBlocks = {};
  generate();
});

$("copyBtn").addEventListener("click", async () => {
  const text = scheduleAsText();
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    $("summary").textContent = "Schedule copied to clipboard.";
  } catch (e) {
    $("summary").textContent = "Could not copy automatically. Select the table and copy it.";
  }
});

$("printBtn").addEventListener("click", () => window.print());

$("clearBtn").addEventListener("click", () => {
  if (!confirm("Remove all subjects and the schedule?")) return;
  subjects = [];
  doneBlocks = {};
  save();
  renderSubjects();
  generate();
  $("summary").textContent = "";
});

$("startTime").addEventListener("change", generate);
$("breakMin").addEventListener("change", generate);

load();
renderSubjects();
generate();
