import { el } from "./dom.js";
import { loadLessons, paragraphs } from "./lessons.js";
import { exerciseTypes, typeOf } from "./exercises/index.js";
import { getProgress, saveResult } from "./progress.js";
import { LANGUAGES, getLanguage, setLanguage, t } from "./i18n.js";

const app = document.getElementById("app");
const langSwitch = document.getElementById("lang-switch");

// Pages:  #/               -> lesson list
//         #/lesson/<id>    -> reading text
//         #/quiz/<id>      -> exercises + score
async function route() {
  const lang = getLanguage();
  document.documentElement.lang = lang;
  renderLanguageSwitch();

  const [, page, id] = location.hash.split("/");
  const { lessons, errors } = await loadLessons(lang);
  if (lang !== getLanguage()) return; // language was switched while loading
  const lesson = lessons.find((l) => l.id === decodeURIComponent(id || ""));

  app.replaceChildren();
  window.scrollTo(0, 0);

  if (page === "lesson" && lesson) return showLesson(lesson);
  if (page === "quiz" && lesson) return showQuiz(lesson);
  showHome(lessons, errors);
}

window.addEventListener("hashchange", route);
route();

// ---------- Language switch (flags in the header) ----------

function renderLanguageSwitch() {
  const current = getLanguage();
  langSwitch.setAttribute("aria-label", t("chooseLanguage"));
  langSwitch.replaceChildren(
    ...Object.entries(LANGUAGES).map(([code, { name, flag }]) => {
      const button = el("button", {
        class: "flag",
        type: "button",
        title: name,
        "aria-label": name,
        "aria-pressed": code === current ? "true" : "false",
        onclick: () => {
          if (code === getLanguage()) return;
          setLanguage(code);
          route(); // redraw the current page in the new language
        },
      });
      button.innerHTML = flag; // trusted SVG from i18n.js
      return button;
    })
  );
}

// ---------- Lesson list ----------

function progressKey(lesson) {
  return `${getLanguage()}/${lesson.id}`;
}

function showHome(lessons, errors) {
  document.title = "School Tutor";
  app.append(el("h1", {}, t("chooseLesson")));

  if (errors.length) {
    app.append(
      el("div", { class: "errors" },
        el("strong", {}, t("lessonErrors")),
        el("ul", {}, errors.map((e) => el("li", {}, el("code", {}, e))))
      )
    );
  }

  if (!lessons.length) {
    app.append(el("p", { class: "muted" }, t("noLessons")));
    return;
  }

  app.append(
    el("div", { class: "lesson-list" },
      lessons.map((lesson) => {
        const progress = getProgress(progressKey(lesson));
        return el("a", { class: "card lesson-item", href: `#/lesson/${encodeURIComponent(lesson.id)}` },
          el("div", {},
            lesson.subject && el("span", { class: "subject-tag" }, lesson.subject),
            el("h2", { style: "margin:6px 0 0" }, lesson.title)
          ),
          progress
            ? el("span", { class: "best-score" }, t("best", { score: progress.bestScore, max: progress.bestMax }))
            : el("span", { class: "muted" }, t("new"))
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
        count === 1 ? t("startQuiz_one") : t("startQuiz_other", { n: count })),
      el("a", { class: "btn secondary", href: "#/" }, t("back"))
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
    el("summary", {}, t("reread")),
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
      el("p", { class: "muted", style: "margin:0 0 8px" }, t("exerciseOf", { i: index + 1, n: total })),
      body
    );
    const button = el("button", { class: "btn", type: "button", disabled: true }, t("check"));
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
        button.textContent = index + 1 < total ? t("next") : t("seeScore");
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
    const saved = saveResult(progressKey(lesson), score, max);
    const pct = max ? Math.round((score / max) * 100) : 0;
    const praise =
      pct >= 90 ? t("praise90") :
      pct >= 70 ? t("praise70") :
      pct >= 50 ? t("praise50") :
                  t("praiseLow");

    stage.replaceChildren(
      el("div", { class: "card", style: "text-align:center" },
        el("h1", {}, praise),
        el("div", { class: "score-big" }, `${score} / ${max}`),
        el("p", { class: "muted" }, t("percentCorrect", { pct })),
        saved.isNewBest && el("p", {}, t("newBest"))
      ),
      el("div", { class: "actions" },
        el("button", { class: "btn", type: "button", onclick: route }, t("tryAgain")),
        el("a", { class: "btn secondary", href: "#/" }, t("backToLessons"))
      )
    );
  }
}
