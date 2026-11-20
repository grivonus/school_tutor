// All exercise types the app knows about.
// To add a new type: create a file next to this one that exports
// validate(exercise) and render(exercise, container, onChange), then register it here.

import * as multipleChoice from "./multiple-choice.js";
import * as categorize from "./categorize.js";

export const exerciseTypes = {
  "multiple-choice": multipleChoice,
  "categorize": categorize,
};

export const DEFAULT_TYPE = "multiple-choice";

export function typeOf(exercise) {
  return exercise.type || DEFAULT_TYPE;
}
