var fs = require('fs');
var Base = require('./base');

var base = '\u001b[39m';
var magenta = '\u001b[35m';
var cyan = '\u001b[36m';
var blue = '\u001b[34m';
var grey = '\u001b[90m';
var green = '\u001b[32m';
var red = '\u001b[31m';
var yellow = '\u001b[33m';
var bold = '\u001b[1m';
var normal = '\u001b[22m';

var isWindows = (process.platform == 'win32');
var cwd = process.cwd();
var specialPattern = /(\.\?\*\+\(\)\[\]\{\}\\)/g;
var dirs = cwd.replace(specialPattern, '\\$1') + '/';
var stackPattern = new RegExp('\n +at ([^\n]*)' + dirs + '([^:\n]*?)([^/:]+):([0-9]+):([0-9]+)([^\n]*)', 'g');

var reserved = /^(break|case|catch|continue|debugger|default|delete|do|else|finally|for|function|if|in|instanceof|new|return|switch|this|throw|try|typeof|var|void|while|with)$/;

/**
 * The `Console` logger writes pretty strings to stdout.
 */
var Console = module.exports = function (config) {
  return Base(config, Console.defaults);
};

/**
 * Set up `Console` logger defaults.
 */
Console.defaults = Base.decorate({

  // Indent messages and space JSON with 2 spaces.
  space: '  ',

  // Stringify with pretty colors.
  stringify: function (data, stack, space) {
    var self = this;
    var selfSpace = self.space;
    if (data === null) {
      data = 'null';
      if (stack) {
        data = red + data + base;
      }
    }
    else if (typeof data == 'function') {
      if (stack) {
        data = '[Function' + (data.name ? ': ' + data.name : '') + ']';
        data = cyan + data + base;
      }
      else {
        data = data.toString();
        if (!selfSpace) {
          data = data.replace(/^function \(/, 'function(');
        }
      }
    }
    else if (data instanceof Date) {
      data = data.toUTCString();
      if (stack) {
        data = cyan + '[Date: ' + data + ']' + base;
      }
    }
    else if (data instanceof Error) {
      data = '' + (data.stack || data);
      if (stack) {
        data = '[Error: ' + data + ']';
      }
    }
    else if (typeof data == 'object') {
      stack = stack || [];
      space = space || '';
      var indent = space + (selfSpace || '');
      var colon = grey + (selfSpace ? ': ' : ':') + base;
      var isCircular = false;
      stack.forEach(function (item, index) {
        if (item == data) {
          isCircular = true;
        }
      });
      if (isCircular) {
        return red + '[Circular]' + base;
      }
      stack.push(data);
      var parts = [];
      var length = 0;
      var text;
      var isArray = (data instanceof Array);
      if (stack.length > 5) {
        data = cyan + (isArray ? '[Array]' : '[Object]') + base;
      }
      else {
        if (isArray) {
          data.forEach(function (value) {
            text = self.stringify(value, stack, indent);
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
                key = grey + key + base;
              }
              text = key + colon + self.stringify(value, stack, indent);
              length += Console.getColorlessLength(text);
              parts.push(text);
            }
          }
        }
        stack.pop();
        if (selfSpace) {
          if (parts.length) {
            length += (parts.length - 1) * 2;
          }
          if (length + indent.length > 60) {
            data = '\n' + indent + parts.join(grey + ',\n' + base + indent) + '\n' + space;
          }
          else {
            data = parts.join(grey + ', ' + base);
          }
        }
        else {
          data = parts.join(grey + ',' + base);
        }
        if (isArray) {
          data = base + '[' + data + ']';
        }
        else {
          data = base + '{' + data + '}';
        }
      }
    }
    else if (stack) {
      if (typeof data == 'string') {
        data = green + '"' + data.replace(/"/g, '\\"') + '"' + base;
      }
      else if (typeof data == 'number') {
        data = magenta + data + base;
      }
      else if (typeof data == 'boolean') {
        data = yellow + data + base;
      }
      else {
        data = blue + data + base;
      }
    }
    else {
      data = '' + data;
    }
    return data;
  },

  // Join arguments together as lines.
  join: function (args) {
    var space = this.space;
    var lines = [];
    for (var index = 0, length = args.length; index < length; index++) {
      var line = args[index];
      if (typeof line != 'string') {
        if (line instanceof Error) {
          line = (line.stack || line.toString());
        }
        else {
          line = this.stringify(line, null, space);
        }
      }
      lines.push(line.replace(/\n/g, '\n' + space));
    }
    return lines.join('\n' + space);
  },

  // Log with colorful symbols instead of log level names.
  prefixes: {
    debug: magenta + (isWindows ? '÷' : '\u2756') + ' ' + base,
    trace: cyan + (isWindows ? '+' : '\u271A') + ' ' + base,
    log: grey + (isWindows ? '\u2192' : '\u279C') + ' ' + base,
    info: green + (isWindows ? '\u221A' : '\u2714') + ' ' + base,
    warn: yellow + (isWindows ? '*' : '\u272D') + ' ' + base,
    error: red + (isWindows ? '\u00D7' : '\u2716') + ' ' + base,
    alarm: red + bold + (isWindows ? '*' : '\u2739') + ' ' + base
  },

  // Maximum number of lines to show before a statement.
  linesBefore: 4,

  // Where to start bracketed text.
  bracketStart: 70,

  // Format a string with colors and optionally stack traces.
  format: function (string, type) {
    var self = this;
    var color = (type == 'warn' ? yellow : (type == 'error' ? red : base));
    string = string.replace(/^\[(\w+)\] ([^\n]+)/, function (match, name, text) {
      var length = Console.getColorlessLength(text);
      var pad = Array(Math.max(self.bracketStart - length, 2)).join(' ');
      return text + pad + grey + name + color;
    });
    var before = self.linesBefore;
    string = string.replace(
      stackPattern,
      function (match, start, path, file, line, char, end) {
        var message = '\n   ' + start + cyan + path +
          base + file + cyan + ':' +
          base + line + cyan + ':' +
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
              indent = color + '    \u279C ' + base;
              pipe = grey + pipe + base;
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
    if (type == 'alarm') {
      string += normal + base;
    }
    else if (type == 'error' || type == 'warn') {
      string += base;
    }
    return self.prefixes[type] + string + '\n';
  }

}, Base.defaults);


/**
 * Get the length of a piece of text with colors removed.
 */
Console.getColorlessLength = function (text) {
  return text.replace(/\u001b\[\d\dm/g, '').length;
};
