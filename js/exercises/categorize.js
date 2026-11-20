// Categorize: drag (or tap) each word into the right box.
// Works with mouse, touch and keyboard (tap/click a word, then tap/click a box).
//
// {
//   "type": "categorize",
//   "question": "Put each word in the right box.",
//   "categories": ["Verbs", "Nouns", "Adjectives"],
//   "items": [
//     { "text": "run",   "category": "Verbs" },
//     { "text": "table", "category": "Nouns" }
//   ],
//   "explanation": "Optional text shown after checking."
// }
// Scoring: 1 point per word placed in the right box.

import { el, shuffle } from "../dom.js";

export function validate(ex) {
  const errors = [];
  if (!Array.isArray(ex.categories) || ex.categories.length < 2) {
    errors.push('"categories" must be a list with at least 2 box names');
    return errors;
  }
  if (!Array.isArray(ex.items) || ex.items.length === 0) {
    errors.push('"items" must be a list with at least 1 word');
    return errors;
  }
  ex.items.forEach((item, i) => {
    if (!item.text) errors.push(`item ${i + 1} is missing "text"`);
    if (!ex.categories.includes(item.category)) {
      errors.push(`item "${item.text}": category "${item.category}" is not one of the categories`);
    }
  });
  return errors;
}

export function render(ex, container, onChange) {
  let selectedChip = null;
  let locked = false;

  const bank = el("div", { class: "word-bank", "aria-label": "Words to sort" });
  bank.dropInto = bank;

  const zones = ex.categories.map((name) => {
    const chipsBox = el("div", { class: "chips" });
    const zone = el("div", { class: "drop-zone", "data-category": name }, el("h3", {}, name), chipsBox);
    zone.dropInto = chipsBox;
    return zone;
  });
  const targets = [bank, ...zones];

  for (const target of targets) {
    target.addEventListener("click", () => {
      if (locked || !selectedChip) return;
      target.dropInto.append(selectedChip);
      select(null);
      onChange();
    });
  }

  function select(chip) {
    selectedChip?.classList.remove("selected");
    selectedChip = chip;
    chip?.classList.add("selected");
    zones.forEach((z) => z.classList.toggle("target", chip !== null));
  }

  function targetAt(x, y, dragged) {
    for (const hit of document.elementsFromPoint(x, y)) {
      if (dragged.contains(hit)) continue;
      return targets.find((t) => t.contains(hit)) ?? null;
    }
    return null;
  }

  function highlight(target) {
    targets.forEach((t) => t.classList.toggle("hover", t === target));
  }

  function enableDrag(chip) {
    chip.addEventListener("pointerdown", (e) => {
      if (locked || e.button !== 0) return;
      const startX = e.clientX;
      const startY = e.clientY;
      let dragging = false;
      chip.setPointerCapture(e.pointerId);

      const move = (ev) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        if (!dragging && Math.hypot(dx, dy) < 6) return; // small wiggle = tap, not drag
        if (!dragging) {
          dragging = true;
          select(null);
          chip.classList.add("dragging");
        }
        chip.style.transform = `translate(${dx}px, ${dy}px)`;
        highlight(targetAt(ev.clientX, ev.clientY, chip));
      };

      const end = (ev) => {
        chip.removeEventListener("pointermove", move);
        chip.removeEventListener("pointerup", end);
        chip.removeEventListener("pointercancel", end);
        if (!dragging) return;
        chip.classList.remove("dragging");
        chip.style.transform = "";
        highlight(null);
        const target = ev.type === "pointerup" ? targetAt(ev.clientX, ev.clientY, chip) : null;
        if (target) {
          target.dropInto.append(chip);
          onChange();
        }
        // A drag also fires a "click" right after; ignore that one.
        chip.justDragged = true;
        setTimeout(() => (chip.justDragged = false), 0);
      };

      chip.addEventListener("pointermove", move);
      chip.addEventListener("pointerup", end);
      chip.addEventListener("pointercancel", end);
    });
  }

  const chips = shuffle(ex.items).map((item) => {
    const chip = el("button", { class: "chip", type: "button" }, item.text);
    chip.item = item;
    chip.addEventListener("click", (e) => {
      e.stopPropagation();
      if (locked || chip.justDragged) return;
      select(chip === selectedChip ? null : chip);
    });
    enableDrag(chip);
    bank.append(chip);
    return chip;
  });

  container.append(
    el("p", { class: "prompt" }, ex.question || "Put each word in the right box."),
    el("p", { class: "muted" }, "Drag the words, or tap a word and then tap a box."),
    bank,
    el("div", { class: "categories" }, ...zones)
  );

  return {
    isReady: () => bank.querySelector(".chip") === null,
    check() {
      locked = true;
      select(null);
      let score = 0;
      for (const chip of chips) {
        const placed = chip.closest(".drop-zone")?.dataset.category;
        chip.disabled = true;
        if (placed === chip.item.category) {
          score++;
          chip.classList.add("correct");
        } else {
          chip.classList.add("wrong");
          chip.append(el("span", { class: "hint" }, `→ ${chip.item.category}`));
        }
      }
      const max = chips.length;
      return {
        score,
        max,
        message: score === max ? "Perfect! 🎉" : `${score} of ${max} words in the right box.`,
        explanation: ex.explanation,
      };
    },
  };
}
