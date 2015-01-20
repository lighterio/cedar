var doNothing = function () {};


/**
 * The `Base` logger defines methods that transports will share.
 */
var Base = module.exports = function (config, defaults) {

  var cedar = require('../../cedar');

  // A logger is a shorthand for `logger.log`, among other things.
  var logger = function () {
    logger.log.apply(logger, arguments);
  };

  // Don't run `setMethods` until all config properties are set.
  var setMethods = doNothing;

  // Define properties that trigger `setMethods`.
  Base.resetters.forEach(function (property) {
    var value;
    Object.defineProperty(logger, property, {
      get: function () {
        return value;
      },
      set: function (newValue) {
        value = newValue;
        setMethods.apply(logger);
      }
    });
  });

  // Copy `config` properties to the `logger`.
  Base.decorate(logger, config, true);

  // Apply default properties.
  Base.decorate(logger, defaults || Base.defaults);

  // Set up logging methods.
  Base.setMethods.apply(logger);

  // Re-run `setMethods` if `resetters` change.
  setMethods = Base.setMethods;

  // Return the fully-decorated log function.
  return logger;

};


/**
 * Some properties will reset methods if changed.
 */
Base.resetters = ['level', 'prefixes', 'format', 'showTrace'];

/**
 * Cedar supports 7 levels of logging.
 */
Base.levels = ['trace', 'debug', 'log', 'info', 'warn', 'error', 'alert'];

/**
 * Share defaults between logger objects.
 */
Base.defaults = {

  // Show all log messages by default.
  level: 'trace',

  // Stream to `stdout` (using `write`).
  stream: process.stdout,

  // Don't add any space to JSON.
  space: '',

  // Stringify with `JSON.stringify`.
  stringify: JSON.stringify,

  // Join arguments together as an array.
  join: function (args) {
    var list = [];
    for (var index = 0, length = args.length; index < length; index++) {
      var arg = args[index];
      if (arg instanceof Error) {
        arg = '"' + (arg.stack || arg.toString()).replace(/\n/, '\\n') + '"';
      }
      else {
        arg = JSON.stringify(arg, null, this.space);
      }
      list.push(arg);
    }
    return '[' + list.join(',') + ']';
  },

  // Start messages with a prefix for each log method.
  prefixes: {
    trace: 'TRACE ',
    debug: 'DEBUG ',
    log: 'LOG ',
    info: 'INFO ',
    warn: 'WARN ',
    error: 'ERROR ',
    alert: 'ALERT '
  },

  // Format a log message.
  format: function (message, type, prefix) {
    return prefix + message + '\n';
  }

};


/**
 * Decorate an object with the properties of another.
 */
Base.decorate = function (object, defaults, shouldOverwrite) {
  object = object || {};
  for (var key in defaults) {
    if (shouldOverwrite || (typeof object[key] == 'undefined')) {
      object[key] = defaults[key];
    }
  }
  return object;
};

/**
 * Create logging methods based on the configured `level`.
 */
Base.setMethods = function () {
  var self = this;
  var found = false;
  if ((Base.levels.indexOf(self.level) < 0) && self.level != 'nothing') {
    self.error('Unknown log level: "' + self.level + '".');
  }
  else {
    Base.levels.forEach(function (methodName, index) {
      if (methodName == self.level) {
        found = true;
      }
      var prefix = self.prefixes[methodName] || '';
      var format = self.format;
      // If this logger is an Emitter, we can catch and emit errors.
      if (self.emit) {
        self[methodName] = found ? function () {
          var message = self.join(arguments);
          message = format.call(self, message, methodName, prefix);
          try {
            self.stream.write(message);
          }
          catch (e) {
            self.emit('error', e);
          }
        } : doNothing;
      }
      // Otherwise, they'll just throw.
      else {
        self[methodName] = found ? function () {
          var message = self.join(arguments);
          message = format.call(self, message, methodName, prefix);
          self.stream.write(message);
        } : doNothing;
      }
    });
    // Wrap the trace method with a stack tracer.
    if (self.trace != doNothing) {
      var traceMethod = self.trace;
      self.trace = function () {
        var e = new Error('');
        Error.captureStackTrace(e, self.trace);
        var l = arguments.length;
        arguments[l] = e.stack.split('\n').splice(2).join('\n');
        arguments.length = ++l;
        traceMethod.apply(self, arguments);
      };
    }
  }
};
