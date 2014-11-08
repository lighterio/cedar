/**
 * Wrap the native JSON.stringify with a method that can be circular-safe.
 *
 * @origin lighter-common/common/json/stringify.js
 * @version 0.0.1
 */

// If JSON.nativeStringify doesn't exist, we haven't wrapped JSON.stringify.
var shouldWrap = !JSON.nativeStringify;

if (shouldWrap) {

  // Reference the native stringify function.
  var stringify = JSON.nativeStringify = JSON.stringify;

  // Create stack function that checks for cycles.
  JSON.stringify = function (object, uncycle, space) {
    var stack = [];
    return stringify(object, uncycle || function (key, value) {
      if (typeof value == 'object' && value) {
        var length = stack.length;
        for (var i = 0; i < length; i++) {
          if (stack[i] == value) {
            return "[Circular " + (length - i) + "]";
          }
        }
        stack.push(value);
      }
      return value;
    }, space);
  };

}
