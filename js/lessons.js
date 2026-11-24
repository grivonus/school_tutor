// Loads lessons from lessons/<language>/ (e.g. lessons/de/) and checks them for mistakes,
// so a typo in a JSON file shows up as a clear message instead of a broken page.

import { exerciseTypes, typeOf } from "./exercises/index.js";
import { validateWordTypes, wordTypesExercise } from "./word-types.js";

const cache = {};

export async function loadLessons(lang) {
  if (cache[lang]) return cache[lang];
  const folder = `lessons/${lang}`;
  const lessons = [];
  const errors = [];

  let files;
  try {
    files = await fetchJson(`${folder}/index.json`);
  } catch (err) {
    return { lessons, errors: [`${folder}/index.json: ${err.message}`] };
  }

  const results = await Promise.allSettled(files.map((f) => fetchJson(`${folder}/${f}`)));
  results.forEach((result, i) => {
    const file = `${folder}/${files[i]}`;
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
      const lesson = result.value;
      lesson.exercises = lesson.exercises || [];
      // The word-types exercise always comes last, after the questions about the text.
      if (lesson.wordTypes) lesson.exercises.push(wordTypesExercise(lesson.wordTypes, lang));
      lessons.push(lesson);
    }
  });

  cache[lang] = { lessons, errors };
  return cache[lang];
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
  if (lesson.wordTypes !== undefined && lesson.text) {
    errors.push(...validateWordTypes(lesson.wordTypes, paragraphs(lesson.text).join("\n")));
  }
  const exercises = lesson.exercises ?? [];
  if (!Array.isArray(exercises)) {
    errors.push('"exercises" must be a list');
    return errors;
  }
  if (exercises.length === 0 && lesson.wordTypes === undefined) {
    errors.push('the lesson needs at least one exercise in "exercises" (or a "wordTypes" block)');
    return errors;
  }
  exercises.forEach((ex, i) => {
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
