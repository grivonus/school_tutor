import { el } from "./dom.js";
import { loadLessons, paragraphs } from "./lessons.js";
import { exerciseTypes, typeOf } from "./exercises/index.js";
import { getProgress, saveResult } from "./progress.js";

const app = document.getElementById("app");

// Pages:  #/               -> lesson list
//         #/lesson/<id>    -> reading text
//         #/quiz/<id>      -> exercises + score
async function route() {
  const [, page, id] = location.hash.split("/");
  const { lessons, errors } = await loadLessons();
  const lesson = lessons.find((l) => l.id === decodeURIComponent(id || ""));

  app.replaceChildren();
  window.scrollTo(0, 0);

  if (page === "lesson" && lesson) return showLesson(lesson);
  if (page === "quiz" && lesson) return showQuiz(lesson);
  showHome(lessons, errors);
}

window.addEventListener("hashchange", route);
route();

// ---------- Lesson list ----------

function showHome(lessons, errors) {
  document.title = "School Tutor";
  app.append(el("h1", {}, "Choose a lesson"));

  if (errors.length) {
    app.append(
      el("div", { class: "errors" },
        el("strong", {}, "Some lessons could not be loaded:"),
        el("ul", {}, errors.map((e) => el("li", {}, el("code", {}, e))))
      )
    );
  }

  if (!lessons.length) {
    app.append(el("p", { class: "muted" }, "No lessons yet."));
    return;
  }

  app.append(
    el("div", { class: "lesson-list" },
      lessons.map((lesson) => {
        const progress = getProgress(lesson.id);
        return el("a", { class: "card lesson-item", href: `#/lesson/${encodeURIComponent(lesson.id)}` },
          el("div", {},
            lesson.subject && el("span", { class: "subject-tag" }, lesson.subject),
            el("h2", { style: "margin:6px 0 0" }, lesson.title)
          ),
          progress
            ? el("span", { class: "best-score" }, `Best: ${progress.bestScore}/${progress.bestMax}`)
            : el("span", { class: "muted" }, "New")
        );
      })
    )
  );
}

// ---------- Reading ----------

function readingText(lesson) {
  return el("div", { class: "reading" }, paragraphs(lesson.text).map((p) => el("p", {}, p)));
}

function showLesson(lesson) {
  document.title = `${lesson.title} – School Tutor`;
  const count = lesson.exercises.length;
  app.append(
    lesson.subject && el("span", { class: "subject-tag" }, lesson.subject),
    el("h1", {}, lesson.title),
    el("div", { class: "card" }, readingText(lesson)),
    el("div", { class: "actions" },
      el("a", { class: "btn", href: `#/quiz/${encodeURIComponent(lesson.id)}` },
        `Start quiz (${count} ${count === 1 ? "exercise" : "exercises"})`),
      el("a", { class: "btn secondary", href: "#/" }, "Back")
    )
  );
}

// ---------- Quiz ----------

function showQuiz(lesson) {
  document.title = `Quiz: ${lesson.title} – School Tutor`;
  const total = lesson.exercises.length;
  let index = 0;
  let score = 0;
  let max = 0;

  const bar = el("div", { style: "width:0%" });
  const reread = el("details", { class: "reread" },
    el("summary", {}, "Re-read the text"),
    readingText(lesson)
  );
  const stage = el("div");
  app.append(
    el("p", { class: "muted", style: "margin:0 0 8px" }, lesson.title),
    el("div", { class: "progress-bar" }, bar),
    reread,
    stage
  );

  showExercise();

  function showExercise() {
    bar.style.width = `${(index / total) * 100}%`;
    const ex = lesson.exercises[index];
    const body = el("div");
    const card = el("div", { class: "card" },
      el("p", { class: "muted", style: "margin:0 0 8px" }, `Exercise ${index + 1} of ${total}`),
      body
    );
    const button = el("button", { class: "btn", type: "button", disabled: true }, "Check");
    let checked = false;

    const exercise = exerciseTypes[typeOf(ex)].render(ex, body, () => {
      button.disabled = !exercise.isReady();
    });

    button.addEventListener("click", () => {
      if (!checked) {
        checked = true;
        const result = exercise.check();
        score += result.score;
        max += result.max;
        card.append(
          el("div", { class: `feedback ${result.score === result.max ? "good" : "bad"}` },
            el("strong", {}, result.message),
            result.explanation && el("p", { style: "margin:6px 0 0" }, result.explanation)
          )
        );
        button.textContent = index + 1 < total ? "Next →" : "See my score";
      } else {
        index++;
        if (index < total) {
          showExercise();
          window.scrollTo(0, 0);
        } else {
          finish();
        }
      }
    });

    stage.replaceChildren(card, el("div", { class: "actions" }, button));
  }

  function finish() {
    bar.style.width = "100%";
    reread.remove();
    window.scrollTo(0, 0);
    const saved = saveResult(lesson.id, score, max);
    const pct = max ? Math.round((score / max) * 100) : 0;
    const praise =
      pct >= 90 ? "Amazing! 🌟" :
      pct >= 70 ? "Great job! 👏" :
      pct >= 50 ? "Good effort! 💪" :
                  "Keep practising – you'll get there! 📖";

    stage.replaceChildren(
      el("div", { class: "card", style: "text-align:center" },
        el("h1", {}, praise),
        el("div", { class: "score-big" }, `${score} / ${max}`),
        el("p", { class: "muted" }, `${pct}% correct`),
        saved.isNewBest && el("p", {}, "🏆 New personal best!")
      ),
      el("div", { class: "actions" },
        el("button", { class: "btn", type: "button", onclick: route }, "Try again"),
        el("a", { class: "btn secondary", href: "#/" }, "Back to lessons")
      )
    );
  }
}
