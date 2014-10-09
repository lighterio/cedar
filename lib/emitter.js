/**
 * Stripped-down Event Emitter.
 */
var Emitter = module.exports = function Emitter() {};

Emitter.prototype = {

  /**
   * Bind a function as a listener for a type of event.
   */
  on: function on(type, fn) {
    var events = this._events = this._events || {};
    var fns = events[type];
    if (!fns) {
      events[type] = fns;
    }
    else if (typeof fns == 'function') {
      events[type] = [fns, fn];
    }
    else {
      fns.push(fn);
    }
  },

  /**
   * Emit an event with optional data.
   */
  emit: function (type, data) {
    var events = this._events;
    if (events) {
      var fns = events[type];
      if (fns) {
        var n = arguments.length - 1;
        if (n > 1) {
          var a = new Array(n);
          while (n) {
            a[--n] = arguments[n + 1];
          }
        }
        if (typeof fns == 'function') {
          if (a) {
            fn.apply(this, a);
          }
          else {
            fn.call(this, data);
          }
        }
        else {
          n = fns.length;
          for (var i = 0; i < n; i++) {
            if (a) {
              fns[i].apply(this, a);
            }
            else {
              fns[i].call(this, data);
            }
          }
        }
      }
    }
  }

};

/**
 * Extend an object to become an event emitter.
 */
Emitter.extend = function (emitter) {
  var proto = Emitter.prototype;
  emitter = emitter || {};
  for (var key in proto) {
    if (proto.hasOwnProperty(key)) {
      emitter[key] = proto[key];
    }
  }
  return emitter;
};
