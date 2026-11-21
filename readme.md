# School Tutor

A simple reading-and-quiz app for kids aged 11–14. Lessons are JSON files: a text to read, followed by exercises that are checked and scored.

## How it works

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

For now, scores are saved **in the browser** (localStorage): each lesson remembers the best score, the last score and the number of attempts. This means scores stay on that device and browser only, and are lost if the browser data is cleared. User accounts (planned) will save scores online instead; only `js/progress.js` will need to change.

## Run it on your computer

The app loads lesson files, so it must be opened through a small local web server (double-clicking `index.html` won't work):

```
python -m http.server 8000
```

Then open http://localhost:8000. (Alternatively, use the VS Code extension "Live Server".)

## Adding a lesson

1. Create a new file in `lessons/`, e.g. `lessons/photosynthesis.json`.
2. Add its file name to `lessons/index.json`.
3. Reload the page. If something is wrong in the file, a red box on the home page tells you which file and what the problem is.

### Lesson format

```json
{
  "id": "photosynthesis",
  "title": "How Plants Make Food",
  "subject": "Biology",
  "text": [
    "First paragraph...",
    "Second paragraph..."
  ],
  "exercises": [ ... ]
}
```

- `id` must be unique; it appears in the page address.
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
- **A new lesson doesn't appear:** check its file name is listed in `lessons/index.json`, then reload the page.
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
js/exercises/           one file per exercise type + index.js registry
lessons/                lesson JSON files + index.json
```

To add a new exercise type, create a file in `js/exercises/` that exports `validate(exercise)` and `render(exercise, container, onChange)`, and register it in `js/exercises/index.js`.

## Changelog

### 2026-11-21 – German and Spanish (planned)

The audience speaks only German and Spanish, so the app is moving away from English:

- **Language switch:** a toggle with a flag (🇩🇪 / 🇪🇸) to switch the whole app between German and Spanish.
- **Bilingual lessons:** every lesson text and its exercises will be provided in two versions, one in German and one in Spanish. The lesson file structure will change to support this.

Status: planned, not yet implemented. Details to follow.

### 2026-11-20 – First prototype

- Lesson list, reading page, quiz and results screen (English).
- Exercise types: multiple choice and categorize (drag and drop or tap).
- Scores saved in the browser.
