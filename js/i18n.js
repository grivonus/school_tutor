// Languages and all texts shown by the app (buttons, messages...).
// Lesson texts are NOT here: they live in lessons/de/ and lessons/es/.
//
// To change a wording, edit it below. Use {name} for values filled in by the app.

export const LANGUAGES = {
  de: {
    name: "Deutsch",
    flag: '<svg viewBox="0 0 5 3" aria-hidden="true"><rect width="5" height="3" fill="#000"/><rect y="1" width="5" height="2" fill="#DD0000"/><rect y="2" width="5" height="1" fill="#FFCE00"/></svg>',
  },
  es: {
    name: "Español",
    flag: '<svg viewBox="0 0 3 2" aria-hidden="true"><rect width="3" height="2" fill="#AA151B"/><rect y="0.5" width="3" height="1" fill="#F1BF00"/></svg>',
  },
};

const TEXTS = {
  de: {
    loading: "Lädt …",
    chooseLesson: "Wähle eine Lektion",
    noLessons: "Noch keine Lektionen.",
    lessonErrors: "Einige Lektionen konnten nicht geladen werden:",
    best: "Bestwert: {score}/{max}",
    new: "Neu",
    startQuiz_one: "Quiz starten (1 Aufgabe)",
    startQuiz_other: "Quiz starten ({n} Aufgaben)",
    back: "Zurück",
    reread: "Text noch einmal lesen",
    exerciseOf: "Aufgabe {i} von {n}",
    check: "Prüfen",
    next: "Weiter →",
    seeScore: "Zu meinem Ergebnis",
    correct: "Richtig! 🎉",
    wrongAnswer: "Leider nicht. Die richtige Antwort ist „{answer}“.",
    sortPrompt: "Ordne jedes Wort dem richtigen Kasten zu.",
    sortHelp: "Ziehe die Wörter – oder tippe erst auf ein Wort und dann auf einen Kasten.",
    wordsToSort: "Wörter zum Sortieren",
    allPlaced: "Alle Wörter verteilt ✓",
    perfect: "Perfekt! 🎉",
    sortScore: "{score} von {max} Wörtern im richtigen Kasten.",
    praise90: "Super! 🌟",
    praise70: "Toll gemacht! 👏",
    praise50: "Guter Versuch! 💪",
    praiseLow: "Weiter üben – du schaffst das! 📖",
    percentCorrect: "{pct} % richtig",
    newBest: "🏆 Neuer persönlicher Rekord!",
    tryAgain: "Nochmal versuchen",
    backToLessons: "Zurück zu den Lektionen",
    chooseLanguage: "Sprache wählen",
    wordTypesPrompt: "Wörter aus dem Text: Ordne jedes Wort der richtigen Wortart zu.",
    nouns: "Nomen",
    verbs: "Verben",
    adjectives: "Adjektive",
    wordTypesTip: "Tipp: Vor ein Nomen kann man „der“, „die“ oder „das“ setzen (der Vulkan). Ein Verb sagt, was jemand tut oder was geschieht (das Magma steigt). Ein Adjektiv beschreibt, wie etwas ist (das heiße Gestein).",
  },
  es: {
    loading: "Cargando…",
    chooseLesson: "Elige una lección",
    noLessons: "Todavía no hay lecciones.",
    lessonErrors: "Algunas lecciones no se pudieron cargar:",
    best: "Mejor: {score}/{max}",
    new: "Nueva",
    startQuiz_one: "Empezar el quiz (1 ejercicio)",
    startQuiz_other: "Empezar el quiz ({n} ejercicios)",
    back: "Volver",
    reread: "Volver a leer el texto",
    exerciseOf: "Ejercicio {i} de {n}",
    check: "Comprobar",
    next: "Siguiente →",
    seeScore: "Ver mi resultado",
    correct: "¡Correcto! 🎉",
    wrongAnswer: "No del todo. La respuesta correcta es «{answer}».",
    sortPrompt: "Pon cada palabra en la caja correcta.",
    sortHelp: "Arrastra las palabras, o toca primero una palabra y después una caja.",
    wordsToSort: "Palabras para ordenar",
    allPlaced: "Todas las palabras colocadas ✓",
    perfect: "¡Perfecto! 🎉",
    sortScore: "{score} de {max} palabras en la caja correcta.",
    praise90: "¡Increíble! 🌟",
    praise70: "¡Muy bien! 👏",
    praise50: "¡Buen intento! 💪",
    praiseLow: "Sigue practicando, ¡lo conseguirás! 📖",
    percentCorrect: "{pct} % de aciertos",
    newBest: "🏆 ¡Nuevo récord personal!",
    tryAgain: "Intentar de nuevo",
    backToLessons: "Volver a las lecciones",
    chooseLanguage: "Elegir idioma",
    wordTypesPrompt: "Palabras del texto: clasifica cada palabra según su clase.",
    nouns: "Sustantivos",
    verbs: "Verbos",
    adjectives: "Adjetivos",
    wordTypesTip: "Pista: un sustantivo nombra una persona, un animal, un lugar, una cosa o una idea (el volcán). Un verbo expresa una acción o lo que pasa (el magma sube). Un adjetivo describe a un sustantivo (la roca sólida).",
  },
};

const STORAGE_KEY = "schoolTutor.language";
const DEFAULT_LANGUAGE = "de";

let current = initialLanguage();

function initialLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved in LANGUAGES) return saved;
  } catch {
    // storage unavailable: fall through
  }
  const browser = (navigator.languages || [navigator.language || ""]).map((l) => l.slice(0, 2).toLowerCase());
  return browser.find((l) => l in LANGUAGES) || DEFAULT_LANGUAGE;
}

export function getLanguage() {
  return current;
}

export function setLanguage(lang) {
  if (!(lang in LANGUAGES)) return;
  current = lang;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // not remembered, but still switches for this visit
  }
}

// t("exerciseOf", { i: 1, n: 4 }) -> "Aufgabe 1 von 4"
export function t(key, values = {}) {
  return tIn(current, key, values);
}

// Same as t(), but for a given language instead of the current one.
export function tIn(lang, key, values = {}) {
  const text = TEXTS[lang]?.[key] ?? TEXTS[DEFAULT_LANGUAGE][key] ?? key;
  return text.replace(/\{(\w+)\}/g, (_, name) => values[name] ?? "");
}
