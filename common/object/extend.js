/**
 * Extend a given object with another object's prototype.
 *
 * @origin lighter-common/common/object/extend.js
 * @version 0.0.1
 */

var proto = Object.prototype;

// When re-required, don't redefine.
if (proto.extend) {
  return;
}

Object.defineProperty(proto, 'extend', {

  // Don't expose the `extend` method.
  enumerable: false,

  // Take an object and give it this object's prototype methods.
  value: function (object) {
    var proto = this.prototype;

    // If no object is passed, make one.
    object = object || {};

    // Overwrite existing values.
    for (var key in proto) {
      object[key] = proto[key];
    }

    return object;
  }

});
