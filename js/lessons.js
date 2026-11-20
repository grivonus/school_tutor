// Loads lessons from the lessons/ folder and checks them for mistakes,
// so a typo in a JSON file shows up as a clear message instead of a broken page.

import { exerciseTypes, typeOf } from "./exercises/index.js";

let cache = null;

export async function loadLessons() {
  if (cache) return cache;
  const lessons = [];
  const errors = [];

  let files;
  try {
    files = await fetchJson("lessons/index.json");
  } catch (err) {
    return { lessons, errors: [`lessons/index.json: ${err.message}`] };
  }

  const results = await Promise.allSettled(files.map((f) => fetchJson(`lessons/${f}`)));
  results.forEach((result, i) => {
    const file = `lessons/${files[i]}`;
    if (result.status === "rejected") {
      errors.push(`${file}: ${result.reason.message}`);
      return;
    }
    const problems = validateLesson(result.value);
    if (lessons.some((l) => l.id === result.value.id)) {
      problems.push(`id "${result.value.id}" is already used by another lesson`);
    }
    if (problems.length) {
      errors.push(...problems.map((p) => `${file}: ${p}`));
    } else {
      lessons.push(result.value);
    }
  });

  cache = { lessons, errors };
  return cache;
}

async function fetchJson(path) {
  const res = await fetch(path, { cache: "no-cache" });
  if (!res.ok) throw new Error(`could not load (HTTP ${res.status})`);
  try {
    return await res.json();
  } catch (err) {
    throw new Error(`invalid JSON – ${err.message}`);
  }
}

function validateLesson(lesson) {
  const errors = [];
  for (const field of ["id", "title", "text"]) {
    if (!lesson[field]) errors.push(`missing "${field}"`);
  }
  if (!Array.isArray(lesson.exercises) || lesson.exercises.length === 0) {
    errors.push('"exercises" must be a list with at least one exercise');
    return errors;
  }
  lesson.exercises.forEach((ex, i) => {
    const type = typeOf(ex);
    const module = exerciseTypes[type];
    if (!module) {
      errors.push(`exercise ${i + 1}: unknown type "${type}"`);
      return;
    }
    errors.push(...module.validate(ex).map((e) => `exercise ${i + 1}: ${e}`));
  });
  return errors;
}

export function paragraphs(text) {
  return Array.isArray(text) ? text : String(text).split(/\n\s*\n/);
}
