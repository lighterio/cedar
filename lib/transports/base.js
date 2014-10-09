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

  // Re-run `setMethods` if trigger properties changed.
  setMethods = Base.setMethods;

  // Return the fully-decorated log function.
  return logger;

};


/**
 * Some properties will reset methods if changed.
 */
Base.resetters = ['level', 'prefixes', 'format'];

/**
 * Cedar supports 6 levels of logging.
 */
Base.levels = ['debug', 'trace', 'log', 'info', 'warn', 'error', 'alarm'];

/**
 * Share defaults between logger objects.
 */
Base.defaults = {

  // Show all log messages by default.
  level: 'debug',

  // Stream to `stdout` (using `write`).
  stream: process.stdout,

  // Don't add any space to JSON.
  space: '',

  // Use a stringify method that accounts for circular references.
  stringify: require('../stringify'),

  // Join arguments together as an array.
  join: function (args) {
    var list = [];
    for (var index = 0, length = args.length; index < length; index++) {
      var arg = args[index];
      if (arg instanceof Error) {
        arg = '"' + (arg.stack || arg.toString()).replace(/\n/, '\\n') + '"';
      }
      else {
        arg = this.stringify(arg, null, this.space);
      }
      list.push(arg);
    }
    return '[' + list.join(',') + ']';
  },

  // Start messages with a prefix for each log method.
  prefixes: {
    debug: 'DEBUG ',
    trace: 'TRACE ',
    log: 'LOG ',
    info: 'INFO ',
    warn: 'WARN ',
    error: 'ERROR ',
    alarm: 'ALARM '
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
    self.error('[Cedar] Unknown log level: "' + self.level + '".');
  }
  else {
    Base.levels.forEach(function (methodName, index) {
      if (methodName == self.level) {
        found = true;
      }
      var prefix = self.prefixes[methodName] || '';
      var format = self.format;
      self[methodName] = found ? function () {
        var message = self.join(arguments);
        message = format.call(self, message, methodName, prefix);
        self.stream.write(message);
      } : doNothing;
    });
  }
};
