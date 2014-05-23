var fs = require('fs');
var base = require('./base');

// TODO: Determine whether this works on more than just Mac OS.
var bash = '\u001b[39m';
var magenta = '\u001b[35m';
var cyan = '\u001b[36m';
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

  var logger = base('console');

	logger.setPrefixes({
    debug: magenta + '\u2756 ' + bash,
    trace: cyan + '\u271A ' + bash,
    log: grey + '\u279C ' + bash,
    info: green + '\u2714 ' + bash,
    error: red + '\u2716 ' + bash,
    warn: yellow + '\u2731 ' + bash
  });

  logger.before = 4;

  logger.setFormat(function (string, type) {
    if (type == 'error' || type == 'warn') {
      var before = logger.before;
      var color = (type == 'warn' ? yellow : red);
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
              n = Array(n.length - numberLength + 1).join(' ') + n;
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

  return logger;

};
