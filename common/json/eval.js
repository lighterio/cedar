/**
 * Evaluate a non-strict JSON string and return its value.
 *
 * @origin lighter-common/common/json/eval.js
 * @version 0.0.1
 */

JSON.eval = function (string, fallback) {
  try {
    eval('JSON.eval.value=' + string);
    return JSON.eval.value;
  }
  catch (error) {
    JSON.eval.error = error;
    return fallback;
  }
};
