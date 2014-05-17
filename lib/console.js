var base = require('./base');

// TODO: Determine whether this works on more than just Mac OS.
var bash = '\u001b[39m';
var magenta = '\u001b[35m';
var cyan = '\u001b[36m';
var grey = '\u001b[90m';
var green = '\u001b[32m';
var red = '\u001b[31m';
var yellow = '\u001b[33m';

var breakIndent = '\n  ';
var specialPattern = /(\.\?\*\+\(\)\[\]\{\}\\)/g;
var escCwd = process.cwd().replace(specialPattern, '\\$1') + '/';
var stackPattern = new RegExp(
  '(  at [^\n]*)' + escCwd + '([^\\):\n]*?):([\\d]+):([\\d]*)([^\n]*)',
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

	logger.setFormat(function (string, type) {
    if (type == 'error') {
      string = red + string + bash;
      string = string.replace(
        stackPattern,
        function (match, start, path, line, char, end) {
          return start + bash + path + red + ':' +
            bash + line + red + ':' + bash + char + red + end;
        }
      );
    }
    else if (type == 'warn') {
      string = yellow + string + bash;
    }
    else {
      string = string.replace(/\n/, breakIndent);
    }
    return logger.getPrefixes()[type] + string;
  });

  return logger;

};
