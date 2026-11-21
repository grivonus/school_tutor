// Multiple choice: one correct answer out of several options.
//
// {
//   "type": "multiple-choice",
//   "question": "What is melted rock underground called?",
//   "options": ["Lava", "Magma", "Basalt", "Ash"],
//   "answer": "Magma",
//   "explanation": "Optional text shown after answering."
// }

import { el } from "../dom.js";
import { t } from "../i18n.js";

export function validate(ex) {
  const errors = [];
  if (!ex.question) errors.push('missing "question"');
  if (!Array.isArray(ex.options) || ex.options.length < 2) {
    errors.push('"options" must be a list with at least 2 answers');
  } else if (!ex.options.includes(ex.answer)) {
    errors.push(`"answer" ("${ex.answer}") must be exactly one of the options`);
  }
  return errors;
}

export function render(ex, container, onChange) {
  let selected = null;

  const buttons = ex.options.map((text) =>
    el("button", {
      class: "option",
      type: "button",
      onclick: () => {
        selected = text;
        buttons.forEach((b) => b.classList.toggle("selected", b.textContent === text));
        onChange();
      },
    }, text)
  );

  container.append(
    el("p", { class: "prompt" }, ex.question),
    el("div", { class: "options" }, ...buttons)
  );

  return {
    isReady: () => selected !== null,
    check() {
      const correct = selected === ex.answer;
      for (const b of buttons) {
        b.disabled = true;
        b.classList.remove("selected");
        if (b.textContent === ex.answer) b.classList.add("correct");
        else if (b.textContent === selected) b.classList.add("wrong");
      }
      return {
        score: correct ? 1 : 0,
        max: 1,
        message: correct ? t("correct") : t("wrongAnswer", { answer: ex.answer }),
        explanation: ex.explanation,
      };
    },
  };
}
