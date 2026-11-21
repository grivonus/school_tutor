# School Tutor

A simple reading-and-quiz app for kids aged 11–14, in **German and Spanish**. Lessons are JSON files: a text to read, followed by exercises that are checked and scored.

## How it works

0. **Language.** Two flags in the top-right corner (🇩🇪 / 🇪🇸) switch the whole app between German and Spanish. The choice is remembered. On the first visit, the app uses Spanish if the browser is set to Spanish, otherwise German.
1. **Lesson list.** The home page shows every lesson, with its subject and the kid's best score so far (or "New" if it hasn't been done yet).
2. **Reading.** Opening a lesson shows the text. When ready, the kid presses **Start quiz**.
3. **Exercises.** Exercises appear one at a time, with a progress bar at the top.
   - The **Check** button only becomes active once the exercise is fully answered (an option picked, or every word placed in a box).
   - After checking, the right and wrong answers are highlighted, with a short message and the optional explanation. The answer can no longer be changed.
   - **Next →** goes to the next exercise.
   - A **Re-read the text** panel above the exercise lets the kid look back at the text at any time.
4. **Results.** At the end the kid sees their score (e.g. `7 / 9`), the percentage, an encouraging message, and "New personal best!" if they beat their previous score. They can **Try again** or go **Back to lessons**.

### Scoring

| Exercise type | Points |
|---|---|
| Multiple choice | 1 point if correct |
| Categorize | 1 point for each item in the right box |

The lesson score is the total of all exercises. Multiple-choice options are shown in the order you write them; categorize items are shuffled each time.

### Where scores are saved

For now, scores are saved **in the browser** (localStorage): each lesson remembers the best score, the last score and the number of attempts. The German and Spanish versions of a lesson are scored separately. This means scores stay on that device and browser only, and are lost if the browser data is cleared. User accounts (planned) will save scores online instead; only `js/progress.js` will need to change.

## Run it on your computer

The app loads lesson files, so it must be opened through a small local web server (double-clicking `index.html` won't work):

```
python -m http.server 8000
```

Then open http://localhost:8000. (Alternatively, use the VS Code extension "Live Server".)

## Adding a lesson

### One lesson = two files (one per language)

Every lesson is written as **two separate files**: one German file in `lessons/de/` and one Spanish file in `lessons/es/`. Each file is a complete lesson on its own (title, text and exercises), written entirely in one language.

Why two files instead of one file containing both languages:

- **Easier to write and read:** each file contains only one language, so there's no mixing of German and Spanish in the same place.
- **Easier to share:** you can give the Spanish file to someone who only speaks Spanish to write or proofread it.
- **Free to differ:** the two versions don't need to be word-for-word translations. A grammar lesson, for example, uses German words in German and Spanish words in Spanish.
- **Safer:** a typo in one file only breaks that one language version; the other one still works.

The two files are linked by having the **same `id`**.

```
lessons/
  de/
    index.json            ← list of German lesson files (in display order)
    vulkane.json          ← "id": "volcanoes"
    wortarten.json        ← "id": "word-types"
  es/
    index.json            ← list of Spanish lesson files (in display order)
    volcanes.json         ← "id": "volcanoes"
    clases-de-palabras.json ← "id": "word-types"
```

### Step by step: adding a new lesson

Example: a new lesson about the water cycle.

**1. Choose an `id`.** A short name in lowercase, with hyphens instead of spaces, no accents. It must be new (not used by another lesson) and is the same for both languages: `water-cycle`.

**2. Create the German file** `lessons/de/wasserkreislauf.json`. The easiest way is to copy an existing lesson file, rename it, and replace the contents:

```json
{
  "id": "water-cycle",
  "title": "Der Wasserkreislauf",
  "subject": "Erdkunde",
  "text": [
    "Erster Absatz …",
    "Zweiter Absatz …"
  ],
  "exercises": [
    {
      "type": "multiple-choice",
      "question": "Wie nennt man es, wenn Wasser zu Dampf wird?",
      "options": ["Verdunstung", "Niederschlag", "Kondensation"],
      "answer": "Verdunstung"
    }
  ]
}
```

**3. Add it to the German list** `lessons/de/index.json`. Add the file name at the position where the lesson should appear (the list order is the order on the home page). Don't forget the comma after the previous line:

```json
[
  "vulkane.json",
  "wortarten.json",
  "wasserkreislauf.json"
]
```

**4. Create the Spanish file** `lessons/es/ciclo-del-agua.json`, with the **same `id`**:

```json
{
  "id": "water-cycle",
  "title": "El ciclo del agua",
  "subject": "Geografía",
  "text": [
    "Primer párrafo …",
    "Segundo párrafo …"
  ],
  "exercises": [
    {
      "type": "multiple-choice",
      "question": "¿Cómo se llama el paso del agua líquida a vapor?",
      "options": ["Evaporación", "Precipitación", "Condensación"],
      "answer": "Evaporación"
    }
  ]
}
```

**5. Add it to the Spanish list** `lessons/es/index.json`:

```json
[
  "volcanes.json",
  "clases-de-palabras.json",
  "ciclo-del-agua.json"
]
```

**6. Check it.** Start the app (see "Run it on your computer"), reload the page, and look at the lesson list with **both flags**. If something is wrong, a red box names the file and the problem. Do the quiz once in each language.

**7. Save it to GitHub.** In Source Control: stage (**+**), commit (e.g. `Add lesson: water cycle`), **Sync Changes**.

### Checklist for each new lesson

- [ ] German file in `lessons/de/`, Spanish file in `lessons/es/`
- [ ] Both files have the **same `id`**
- [ ] Both file names added to their language's `index.json`
- [ ] Each multiple-choice `answer` is written exactly like one of its `options`
- [ ] Each categorize item's `category` is written exactly like one of the `categories`
- [ ] No red box on the home page, in either language

**Good to know:**
- File names can be anything (ending in `.json`); using the lesson's name in that language makes them easy to find.
- A lesson can exist in only one language for a while (e.g. the Spanish version is still being written): it simply doesn't appear in the other language's list.
- To remove a lesson, delete its file name from `index.json` (and delete the file).

### Lesson format

```json
{
  "id": "photosynthesis",
  "title": "Wie Pflanzen Nahrung herstellen",
  "subject": "Biologie",
  "text": [
    "Erster Absatz...",
    "Zweiter Absatz..."
  ],
  "exercises": [ ... ]
}
```

- `id` must be unique within a language, and the same in the German and Spanish version of a lesson; it appears in the page address.
- `text` can be a list of paragraphs, or one string with paragraphs separated by a blank line (`\n\n`).
- `subject` is optional.

### Exercise types

**Multiple choice** — one correct answer (1 point):

```json
{
  "type": "multiple-choice",
  "question": "What is melted rock underground called?",
  "options": ["Lava", "Magma", "Ash", "Crust"],
  "answer": "Magma",
  "explanation": "Optional: shown after answering."
}
```

`answer` must be written exactly like one of the `options`.

**Categorize** — drag (or tap) each item into the right box (1 point per item):

```json
{
  "type": "categorize",
  "question": "Drag each word into the right box.",
  "categories": ["Nouns", "Verbs", "Adjectives"],
  "items": [
    { "text": "dog",   "category": "Nouns" },
    { "text": "jump",  "category": "Verbs" },
    { "text": "green", "category": "Adjectives" }
  ],
  "explanation": "Optional: shown after checking."
}
```

Each item's `category` must be written exactly like one of the `categories`.

## Troubleshooting

- **A red box on the home page:** a lesson file has a problem. The message names the file and what's wrong (e.g. invalid JSON, an `answer` that isn't one of the `options`, a duplicate `id`). Lessons with problems are hidden until fixed; the others still work.
- **"Invalid JSON":** usually a missing or extra comma, or a missing quote. Pasting the file into https://jsonlint.com shows the exact line.
- **A new lesson doesn't appear:** check its file name is listed in the `index.json` of the right language folder (`lessons/de/` or `lessons/es/`), and that the right flag is selected, then reload the page.
- **Blank page / "Loading…" forever:** the page was opened by double-clicking `index.html`. Use the local server described above.

## Publishing on GitHub Pages

1. Push the project to a GitHub repository.
2. On GitHub, open the repository → **Settings** → **Pages**.
3. Under "Build and deployment", choose **Deploy from a branch**, select branch `main` and folder `/ (root)`, and click **Save**.
4. After a minute the app is live at `https://<your-username>.github.io/<repository-name>/`.

From then on, every push to `main` (e.g. a new lesson) updates the live site automatically within a minute or two.

## Project structure

```
index.html              the page
css/style.css           look and feel
js/app.js               pages: lesson list, reading, quiz, results
js/lessons.js           loads and checks lesson files
js/progress.js          saves scores (in the browser for now; accounts later)
js/i18n.js              languages, flags, and all app texts (buttons, messages) in German and Spanish
js/exercises/           one file per exercise type + index.js registry
lessons/de/, lessons/es/  lesson JSON files + index.json, one folder per language
```

To change a button or message text, edit it in `js/i18n.js`. Messages for the lesson author (the red error box) stay in English.

To add a new exercise type, create a file in `js/exercises/` that exports `validate(exercise)` and `render(exercise, container, onChange)`, and register it in `js/exercises/index.js`.

## Changelog

### 2026-11-21 – German and Spanish

The audience speaks only German and Spanish, so the app no longer uses English:

- **Language switch:** two flags (🇩🇪 / 🇪🇸) in the header switch the whole app between German and Spanish. The choice is remembered.
- **Bilingual lessons:** lessons now live in `lessons/de/` and `lessons/es/`, one version per language, linked by the same `id`. The old English lessons in `lessons/` were replaced by German and Spanish versions.
- **App texts:** all buttons and messages are translated, in `js/i18n.js`.
- Scores are kept separately per language.

Status: implemented on branch `multi_language`, not yet merged into `main`.

### 2026-11-20 – First prototype

- Lesson list, reading page, quiz and results screen (English).
- Exercise types: multiple choice and categorize (drag and drop or tap).
- Scores saved in the browser.
