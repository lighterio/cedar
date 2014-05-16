/**
 * The "console" logger writes to stdout in color.
 */
module.exports = function createConsoleLogger() {

	// TODO: Determine whether this works on more than just Mac OS.
	var bash = '\u001b[39m';
	var magenta = '\u001b[35m';
	var cyan = '\u001b[36m';
	var grey = '\u001b[90m';
	var green = '\u001b[32m';
	var red = '\u001b[31m';
	var yellow = '\u001b[33m';

	var prefixes = {
		debug: magenta + '\u2756 ' + bash,
		trace: cyan + '\u271A ' + bash,
		log: grey + '\u279C ' + bash,
		info: green + '\u2714 ' + bash,
		error: red + '\u2716 ' + bash,
		warn: yellow + '\u2731 ' + bash
	};

	var breakIndent = '\n  ';
	var specialPattern = /(\.\?\*\+\(\)\[\]\{\}\\)/g;
	var escCwd = process.cwd().replace(specialPattern, '\\$1') + '/';
	var stackPattern = new RegExp(
		'(  at [^\n]*)' + escCwd + '([^\\):\n]*?):([\\d]+):([\\d]*)([^\n]*)',
		'g'
	);

	var format = function (string, prefix, type) {
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
		return prefix + string;
	};

	var jsonSpace = '  ';

	var logger = function logger() {
		logger.log.apply(logger, arguments);
	};

	logger.type = 'console';

	logger.setLevel = function setLevel(level) {
		var numbers = {debug: 0, trace: 1, log: 2, info: 3, warn: 4, error: 5};
		var number = numbers[level];
		if (typeof number == 'undefined') {
			if (level != 'nothing') {
				logger.warn('Unknown log level: "' + level + '".');
			}
			number = 9;
		}
		var meh = function() {};
		logger.level = level;
		logger.debug = number < 1 ? debug : meh;
		logger.trace = number < 2 ? trace : meh;
		logger.log = number < 3 ? log : meh;
		logger.info = number < 4 ? info : meh;
		logger.warn = number < 5 ? warn : meh;
		logger.error = number < 6 ? error : meh;
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
			format.debug = value;
			format.trace = value;
			format.log = value;
			format.info = value;
			format.warn = value;
			format.error = value;
		}
	};

	logger.setFormat(format);

	logger.setJsonSpace = function setJsonSpace(value) {
		jsonSpace = value;
	};

	var debug = logger.debug = function error(message) {
		if (typeof message != 'string') {
			message = JSON.stringify(message, null, jsonSpace);
		}
		var prefix = prefixes.debug;
		process.stdout.write(format.debug(message, prefix, 'debug') + '\n');
	};

	var trace = logger.trace = function trace(message) {
		if (typeof message != 'string') {
			message = JSON.stringify(message, null, jsonSpace);
		}
		var prefix = prefixes.trace;
		process.stdout.write(format.trace(message, prefix, 'trace') + '\n');
	};

	var log = logger.log = function log(message) {
		if (typeof message != 'string') {
			message = JSON.stringify(message, null, jsonSpace);
		}
		var prefix = prefixes.log;
		process.stdout.write(format.log(message, prefix, 'log') + '\n');
	};

	var info = logger.info = function error(message) {
		if (typeof message != 'string') {
			message = JSON.stringify(message, null, jsonSpace);
		}
		var prefix = prefixes.info;
		process.stdout.write(format.info(message, prefix, 'info') + '\n');
	};

	var warn = logger.warn = function error(message) {
		if (typeof message != 'string') {
			message = JSON.stringify(message, null, jsonSpace);
		}
		var prefix = prefixes.warn;
		process.stdout.write(format.warn(message, prefix, 'warn') + '\n');
	};

	var error = logger.error = function error(message) {
		if (typeof message != 'string') {
			message = JSON.stringify(message, null, jsonSpace);
		}
		var prefix = prefixes.error;
		process.stdout.write(format.error(message, prefix, 'error') + '\n');
	};

	return logger;
}
