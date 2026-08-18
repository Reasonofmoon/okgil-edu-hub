const KEY = "okh.students.v1";

export function loadStudents() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveStudents(rows) {
  localStorage.setItem(KEY, JSON.stringify(rows));
}

export function addStudent(row) {
  const rows = loadStudents();
  const next = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    name: row.name,
    schoolCode: row.schoolCode,
    grade: row.grade || "",
    className: row.className || "",
    passes: Number(row.passes || 4),
  };
  rows.push(next);
  saveStudents(rows);
  return next;
}

export function removeStudent(id) {
  saveStudents(loadStudents().filter((r) => r.id !== id));
}

export function loadChecks() {
  try {
    return JSON.parse(localStorage.getItem("okh.books.v1") || "{}");
  } catch {
    return {};
  }
}

export function saveChecks(map) {
  localStorage.setItem("okh.books.v1", JSON.stringify(map));
}
