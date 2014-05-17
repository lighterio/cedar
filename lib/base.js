var logMethods = ['error', 'warn', 'info', 'log', 'trace', 'debug'];
var doNothing = function() {};

/**
 * The base logger defines methods that loggers will share.
 */
module.exports = function createLogger(transportType) {

  var logger = function logger() {
    logger.log.apply(logger, arguments);
  };

  logMethods.forEach(function (methodName) {
    logger[methodName] = function () {
      logger.write(arguments, methodName);
    };
  });

  var stream = process.stdout;

  var prefixes = {};

  var originalMethods = [];

  var jsonSpace = '  ';

  var format = function (message, type) {
    return type.toUpperCase() + ': ' + message;
  };

  logger.type = transportType;

  logger.setLevel = function setLevel(level) {
    var number;
    logMethods.forEach(function (methodName, index) {
      if (methodName == level) {
        number = index;
      }
      if (!originalMethods[index]) {
        originalMethods[index] = logger[methodName];
      }
    });
    if (isNaN(number)) {
      if (level != 'nothing') {
        logger.warn('Unknown log level: "' + level + '".');
      }
      number = -1;
    }
    logger.level = level;
    logMethods.forEach(function (methodName, index) {
      logger[methodName] = number >= index ? originalMethods[index] : doNothing;
    });
  };

  logger.getPrefixes = function getPrefixes() {
    return prefixes;
  };

  logger.setPrefixes = function setPrefixes(value) {
    prefixes = value;
    breakIndent = '\n' + Array((prefixes.log || '').length + 1).join(' ');
  };

  logger.setFormat = function setFormat(value, type) {
    if (type) {
      format[type] = value;
    }
    else {
      format = value;
      logMethods.forEach(function (name, index) {
        format[name] = value;
      });
    }
  };

  logger.setFormat(format);

  logger.setJsonSpace = function setJsonSpace(value) {
    jsonSpace = value;
  };

  logger.stringifyArguments = function stringifyArguments(arguments) {
    var lines = [];
    for (var index = 0, length = arguments.length; index < length; index++) {
      var line = arguments[index];
      if (typeof line != 'string') {
        // TODO: Are there other cases where we should use toString()?
        if (line instanceof Error) {
          line = line.stack;
        } else {
          line = JSON.stringify(line, null, jsonSpace);
        }
      }
      lines.push(line);
    }
    return lines.join('\n  ');
  };

  logger.write = function (args, type) {
    var message = logger.stringifyArguments(args);
    stream.write(format[type](message, type) + '\n');
  };

  return logger;

};
