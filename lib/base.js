var logMethods = ['error', 'warn', 'info', 'log', 'trace', 'debug'];
var doNothing = function() {};

/**
 * The base logger defines methods that loggers will share.
 */
module.exports = function createLogger(options) {

  options = options || {};

  var logger = function logger() {
    logger.log.apply(logger, arguments);
  };

  logMethods.forEach(function (methodName) {
    logger[methodName] = function () {
      logger.write(arguments, methodName);
    };
  });

  var prefixes = {};

  var originalMethods = [];

  var jsonSpace = '  ';

  var breakIndent = '\n  ';

  var format = function (message, type) {
    return type.toUpperCase() + ': ' + message;
  };

  logger.type = options.type || 'base';

  logger.stream = options.stream || process.stdout;

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
    breakIndent = '\n' + value;
  };

  logger.stringifyArguments = function stringifyArguments(args) {
    var lines = [];
    for (var index = 0, length = args.length; index < length; index++) {
      var line = args[index];
      if (typeof line != 'string') {
        // TODO: Are there other cases where we should use toString()?
        if (line instanceof Error) {
          line = line.stack;
        } else {
          line = logger.stringify(line, null, '');
        }
      }
      lines.push(line.replace(/\n/g, breakIndent));
    }
    return lines.join(breakIndent);
  };

  var reserved = /^(break|case|catch|continue|debugger|default|delete|do|else|finally|for|function|if|in|instanceof|new|return|switch|this|throw|try|typeof|var|void|while|with)$/;

  logger.stringify = function (data, stack, space) {
    if (data === null) {
      data = 'null';
    }
    else if (typeof data == 'function') {
      if (stack) {
        data = '[Function]';
      }
      else {
        data = data.toString();
        if (!jsonSpace) {
          data = data.replace(/^function \(/, 'function(');
        }
      }
    }
    else if (data instanceof Date) {
      data = data.toUTCString();
    }
    else if (typeof data == 'object') {
      stack = stack || [];
      space = space || '';
      var indent = space + (jsonSpace || '');
      var colon = jsonSpace ? ': ' : ':';
      var isCircular = false;
      stack.forEach(function (item, index) {
        if (item == data) {
          isCircular = true;
        }
      });
      if (isCircular) {
        return '[Circular]';
      }
      stack.push(data);
      var parts = [];
      var length = 0;
      var text;
      var isArray = (data instanceof Array);
      if (stack.length > 5) {
        data = isArray ? '[Array]' : '[Object]';
      }
      else {
        if (isArray) {
          data.forEach(function (value) {
            text = logger.stringify(value, stack, indent);
            length += text.length;
            parts.push(text);
          });
        }
        else {
          for (var key in data) {
            if (data.hasOwnProperty(key)) {
              var value = data[key];
              if (reserved.test(key)) {
                key = '"' + key + '"';
              }
              text = key + colon + logger.stringify(value, stack, indent);
              length += text.length;
              parts.push(text);
            }
          }
        }
        stack.pop();
        if (jsonSpace) {
          if (parts.length) {
            length += (parts.length - 1) * 2;
          }
          if (length + space > 60) {
            data = '\n' + indent + parts.join(',\n' + indent) + '\n' + space;
          }
          else {
            data = parts.join(', ');
          }
        }
        else {
          data = parts.join(',');
        }
        if (isArray) {
          data = '[' + data + ']';
        }
        else {
          data = '{' + data + '}';
        }
      }
    }
    else if ((typeof data == 'string') && stack) {
      data = '"' + data.replace(/"/g, '\\"') + '"';
    }
    else {
      data = '' + data;
    }
    return data;
  };

  logger.write = function (args, type) {
    var message = logger.stringifyArguments(args);
    logger.stream.write(format[type](message, type) + '\n');
  };

  return logger;

};
