require('colors');

module.exports = function() {

	var prefixes = {
		trace: '\u271A '.cyan,
		debug: '\u2756 '.magenta,
		log: '\u279C '.grey,
		info: '\u2714 '.green,
		warn: '\u2731 '.yellow,
		error: '\u2716 '.red
	};

	var breakIndent = '\n  ';

	var format = function (string, prefix) {
		return prefix + string.replace(/\n/g, breakIndent);
	};

	var jsonSpace = '  ';

	var logger = function logger() {
		logger.log.apply(logger, arguments);
	};

	logger.type = 'console';

	logger.setLevel = function setLevel(level) {
		var numbers = {trace: 0, debug: 1, log: 2, info: 3, warn: 4, error: 5};
		var number = numbers[level];
		if (typeof number == 'undefined') {
			if (level != 'nothing') {
				logger.warn('Unknown log level: "' + level + '".');
			}
			number = 9;
		}
		var meh = function() {};
		logger.level = level;
		logger.trace = number < 1 ? trace : meh;
		logger.debug = number < 2 ? debug : meh;
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

	logger.setFormat = function setFormat(value) {
		format = value;
	};

	logger.setJsonSpace = function setJsonSpace(value) {
		jsonSpace = value;
	};

	var trace = logger.trace = function trace(message) {
		if (typeof message != 'string') {
			message = JSON.stringify(message, null, jsonSpace);
		}
		var prefix = prefixes.trace;
		process.stdout.write(format(message, prefix) + '\n');
	};

	var debug = logger.debug = function error(message) {
		if (typeof message != 'string') {
			message = JSON.stringify(message, null, jsonSpace);
		}
		var prefix = prefixes.debug;
		process.stdout.write(format(message, prefix) + '\n');
	};

	var log = logger.log = function log(message) {
		if (typeof message != 'string') {
			message = JSON.stringify(message, null, jsonSpace);
		}
		var prefix = prefixes.log;
		process.stdout.write(format(message, prefix) + '\n');
	};

	var info = logger.info = function error(message) {
		if (typeof message != 'string') {
			message = JSON.stringify(message, null, jsonSpace);
		}
		var prefix = prefixes.info;
		process.stdout.write(format(message, prefix) + '\n');
	};

	var warn = logger.warn = function error(message) {
		if (typeof message != 'string') {
			message = JSON.stringify(message, null, jsonSpace);
		}
		var prefix = prefixes.warn;
		process.stdout.write(format(message, prefix).yellow + '\n');
	};

	var error = logger.error = function error(message) {
		if (typeof message != 'string') {
			message = JSON.stringify(message, null, jsonSpace);
		}
		var prefix = prefixes.error;
		process.stdout.write(format(message, prefix).red + '\n');
	};

	return logger;
}