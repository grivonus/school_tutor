// Saves quiz results. For now they live in this browser (localStorage).
// When accounts are added, only this file needs to change: the rest of the app
// just calls getProgress() and saveResult().

const KEY = "schoolTutor.progress";

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

export function getProgress(lessonId) {
  return load()[lessonId] || null;
}

export function saveResult(lessonId, score, max) {
  const all = load();
  const prev = all[lessonId];
  const pct = max ? score / max : 0;
  const isBest = !prev || pct > prev.bestScore / prev.bestMax;
  all[lessonId] = {
    attempts: (prev?.attempts || 0) + 1,
    bestScore: isBest ? score : prev.bestScore,
    bestMax: isBest ? max : prev.bestMax,
    lastScore: score,
    lastMax: max,
    lastPlayed: new Date().toISOString(),
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // Storage unavailable (e.g. private browsing): the quiz still works, it just isn't remembered.
  }
  return { ...all[lessonId], isNewBest: isBest && !!prev };
}
