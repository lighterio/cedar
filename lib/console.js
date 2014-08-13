var fs = require('fs');
var base = require('./base');

// TODO: Determine whether this works on more than just Mac OS.
var bash = '\u001b[39m';
var magenta = '\u001b[35m';
var cyan = '\u001b[36m';
var blue = '\u001b[34m';
var grey = '\u001b[90m';
var green = '\u001b[32m';
var red = '\u001b[31m';
var yellow = '\u001b[33m';

var cwd = process.cwd();
var specialPattern = /(\.\?\*\+\(\)\[\]\{\}\\)/g;
var escCwd = cwd.replace(specialPattern, '\\$1') + '/';
var stackPattern = new RegExp(
  '\n +at ([^\n]*)' + escCwd + '([^:\n]*?)([^\\/:]+):([0-9]+):([0-9]+)([^\n]*)',
  'g'
);

/**
 * The "console" logger writes to stdout in color.
 */
module.exports = function createConsoleLogger() {

  var logger = base({type: 'console'});

  var isWin32 = (process.platform == 'win32');

  logger.setPrefixes({
    debug: magenta + (isWin32 ? '÷' : '\u2756') + ' ' + bash,
    trace: cyan + (isWin32 ? '+' : '\u271A') + ' ' + bash,
    log: grey + (isWin32 ? '\u2192' : '\u279C') + ' ' + bash,
    info: green + (isWin32 ? '\u221A' : '\u2714') + ' ' + bash,
    error: red + (isWin32 ? '\u00D7' : '\u2716') + ' ' + bash,
    warn: yellow + (isWin32 ? '*' : '\u2731') + ' ' + bash
  });

  logger.before = 4;

  var getColorlessLength = function (text) {
    var specials = text.match(/\u001b\[\d\dm/g);
    return text.length - (specials ? specials.length : 0) * 5;
  };

  logger.setFormat(function (string, type) {
    var color = (type == 'warn' ? yellow : (type == 'error' ? red : bash));
    string = string.replace(/^\[(\w+)\] ([^\n]+)/, function (match, name, text) {
      var specials = text.match(/\u001b\[\d\dm/g);
      var length = getColorlessLength(text);
      var pad = Array(Math.max(50 - length, 2)).join(' ');
      return text + pad + grey + name + color;
    });
    if (type == 'error' || type == 'warn') {
      var before = logger.before;
      string = string.replace(
        stackPattern,
        function (match, start, path, file, line, char, end) {
          var message = '\n   ' + start + cyan + path +
            bash + file + cyan + ':' +
            bash + line + cyan + ':' +
            green + char + color + end;
          if (before >= 0) {
            var lineNumber = line * 1; // 1-indexed
            var lines;
            try {
              lines = fs.readFileSync(cwd + '/' + path + file);
              lines = ('' + lines).split('\n');
            }
            catch (e) {
              lines = [];
            }
            message += grey;
            start = Math.max(1, lineNumber - before);
            end = Math.min(lines.length, lineNumber + (before ? 1 : 0));
            var numberLength = ('' + end).length;
            for (var i = start; i <= end; i++) {
              line = lines[i - 1];
              var indent = '      ';
              var pipe = '| ';
              if (i == lineNumber) {
                char--;
                line = line.substr(0, char) + green + line.substr(char) + grey;
                indent = color + '    \u279C ' + bash;
                pipe = grey + pipe + bash;
              }
              var n = '' + i;
              n = Array(numberLength - n.length + 1).join(' ') + n;
              message += '\n' + indent + n + pipe + line.replace('\t', '  ');
            }
            message += color;
            before--;
          }
          return message;
        }
      ).replace(/\n +at /g, '\n   ');
      string = color + string + bash;
    }
    return logger.getPrefixes()[type] + string;
  });

  var reserved = /^(break|case|catch|continue|debugger|default|delete|do|else|finally|for|function|if|in|instanceof|new|return|switch|this|throw|try|typeof|var|void|while|with)$/;

  logger.stringify = function (data, stack, space) {
    var jsonSpace = logger.jsonSpace;
    if (data === null) {
      data = 'null';
      if (stack) {
        data = red + data + bash;
      }
    }
    else if (typeof data == 'function') {
      if (stack) {
        data = '[Function' + (data.name ? ': ' + data.name : '') + ']';
        data = cyan + data + bash;
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
      if (stack) {
        data = cyan + '[Date: ' + data + ']' + bash;
      }
    }
    else if (typeof data == 'object') {
      stack = stack || [];
      space = space || '';
      var indent = space + (jsonSpace || '');
      var colon = grey + (jsonSpace ? ': ' : ':') + bash;
      var isCircular = false;
      stack.forEach(function (item, index) {
        if (item == data) {
          isCircular = true;
        }
      });
      if (isCircular) {
        return red + '[Circular]' + bash;
      }
      stack.push(data);
      var parts = [];
      var length = 0;
      var text;
      var isArray = (data instanceof Array);
      if (stack.length > 5) {
        data = cyan + (isArray ? '[Array]' : '[Object]') + bash;
      }
      else {
        if (isArray) {
          data.forEach(function (value) {
            text = logger.stringify(value, stack, indent);
            length += text.replace().length;
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
              else if (key[0] == '_') {
                key = grey + key + bash;
              }
              text = key + colon + logger.stringify(value, stack, indent);
              length += getColorlessLength(text);
              parts.push(text);
            }
          }
        }
        stack.pop();
        if (jsonSpace) {
          if (parts.length) {
            length += (parts.length - 1) * 2;
          }
          if (length + indent.length > 60) {
            data = '\n' + indent + parts.join(grey + ',\n' + bash + indent) + '\n' + space;
          }
          else {
            data = parts.join(grey + ', ' + bash);
          }
        }
        else {
          data = parts.join(grey + ',' + bash);
        }
        if (isArray) {
          data = bash + '[' + data + ']';
        }
        else {
          data = bash + '{' + data + '}';
        }
      }
    }
    else if (stack) {
      if (typeof data == 'string') {
        data = green + '"' + data.replace(/"/g, '\\"') + '"' + bash;
      }
      else if (typeof data == 'number') {
        data = magenta + data + bash;
      }
      else if (typeof data == 'boolean') {
        data = yellow + data + bash;
      }
      else {
        data = blue + data + bash;
      }
    }
    else {
      data = '' + data;
    }
    return data;
  };

  return logger;

};
