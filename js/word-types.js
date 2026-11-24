// Word types (nouns, verbs, adjectives) taken from a lesson's own text.
//
// A lesson can have an optional "wordTypes" block:
//
//   "wordTypes": {
//     "nouns":      ["Magma", "Gestein"],
//     "verbs":      ["steigt", "schmilzt"],
//     "adjectives": ["heiß", "feste"],
//     "uppercase":  true,                 optional: show the words in CAPITALS
//     "question":   "…",                  optional: replaces the default question
//     "explanation": "…"                  optional: replaces the default tip
//   }
//
// The app turns it into a "categorize" exercise, added after the lesson's other
// exercises. Box names, question and tip come from i18n.js in the lesson's language.
// Every word must appear in the lesson text, written as it is there.

import { tIn } from "./i18n.js";

const GROUPS = ["nouns", "verbs", "adjectives"];

export function validateWordTypes(wordTypes, fullText) {
  const errors = [];
  if (typeof wordTypes !== "object" || wordTypes === null || Array.isArray(wordTypes)) {
    return ['"wordTypes" must be an object like { "nouns": [...], "verbs": [...], "adjectives": [...] }'];
  }
  const unknown = Object.keys(wordTypes).filter(
    (k) => !GROUPS.includes(k) && !["uppercase", "question", "explanation"].includes(k)
  );
  if (unknown.length) errors.push(`"wordTypes": unknown field(s) ${unknown.map((k) => `"${k}"`).join(", ")}`);

  const seen = new Map();
  let total = 0;
  for (const group of GROUPS) {
    const words = wordTypes[group];
    if (words === undefined) continue;
    if (!Array.isArray(words)) {
      errors.push(`"wordTypes.${group}" must be a list of words`);
      continue;
    }
    for (const word of words) {
      if (typeof word !== "string" || !word.trim()) {
        errors.push(`"wordTypes.${group}" contains an empty or non-text entry`);
        continue;
      }
      total++;
      const key = word.trim().toLowerCase();
      if (seen.has(key)) {
        errors.push(`"wordTypes": "${word}" is listed twice (in ${seen.get(key)} and ${group})`);
      }
      seen.set(key, group);
      if (!appearsIn(word.trim(), fullText)) {
        errors.push(`"wordTypes.${group}": "${word}" does not appear in the text (write it exactly as in the text)`);
      }
    }
  }
  if (total === 0) errors.push('"wordTypes" must contain at least one word');
  return errors;
}

export function wordTypesExercise(wordTypes, lang) {
  const label = (group) => tIn(lang, group);
  const show = (word) => (wordTypes.uppercase ? word.trim().toLocaleUpperCase(lang) : word.trim());
  return {
    type: "categorize",
    question: wordTypes.question || tIn(lang, "wordTypesPrompt"),
    categories: GROUPS.map(label),
    items: GROUPS.flatMap((group) =>
      (wordTypes[group] || []).map((word) => ({ text: show(word), category: label(group) }))
    ),
    explanation: wordTypes.explanation || tIn(lang, "wordTypesTip"),
  };
}

// Whole-word, case-insensitive search ("Magma" matches "Magma." but not only "Magmakammer").
function appearsIn(word, text) {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, "iu").test(text);
}
