var cluster = require('cluster');
var cedar = require('../../cedar');
var Base = require('./base');

/**
 * The `Multi` logger logs to an array of loggers.
 */
var Multi = module.exports = function (loggers) {

  // The multi logger is a "log" function alias, like all other Cedar loggers.
  var logger = function () {
    for (var i = 0, l = loggers.length; i < l; i++) {
      var item = logger[i];
      item.apply(item, arguments);
    }
  };

  // Self identify as a `Multi` logger.
  logger.transport = 'multi';

  // Make the array of loggers externally accessible.
  logger.loggers = loggers;

  // Instantiate a logger for each item in the array.
  // Each item becomes a cedar logger.
  loggers.forEach(function (item, i) {
    if (typeof item == 'string') {
      item = {transport: item};
    }
    item.transport = item.transport || 'console';
    logger[i] = loggers[i] = cedar(item.transport, item.config || item);
  });

  // Set up all logging methods.
  Base.levels.forEach(function (methodName) {
    logger[methodName] = function () {
      for (var i = 0, l = loggers.length; i < l; i++) {
        var item = logger[i];
        item[methodName].apply(item, arguments);
      }
    };
  });

  return logger;

};
