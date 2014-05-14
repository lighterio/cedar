require('colors');

var symbols = {
	log: '\u279C '.grey,
	trace: '\u271A '.cyan,
	debug: '\u2756 '.magenta,
	warn: '\u2731 '.yellow,
	info: '\u2714 '.green,
	error: '\u2716 '.red
};

var logger = module.exports = function () {
	logger.log.apply(logger, arguments);
};

logger.type = 'console';

logger.debug = function error(message) {
	if (typeof message != 'string') {
		message = JSON.stringify(message, null, '  ');
	}
	console.log(symbols.debug + message.replace(/\n/g, '\n  '));
};

logger.trace = function trace(message) {
	if (typeof message != 'string') {
		message = JSON.stringify(message, null, '  ');
	}
	console.log(symbols.trace + message.replace(/\n/g, '\n  '));
};

logger.log = function log(message) {
	if (typeof message != 'string') {
		message = JSON.stringify(message, null, '  ');
	}
	console.log(symbols.log + message.replace(/\n/g, '\n  '));;
};

logger.info = function error(message) {
	if (typeof message != 'string') {
		message = JSON.stringify(message, null, '  ');
	}
	console.log(symbols.info + message.replace(/\n/g, '\n  '));
};

logger.warn = function error(message) {
	if (typeof message != 'string') {
		message = JSON.stringify(message, null, '  ');
	}
	console.log(symbols.warn + message.replace(/\n/g, '\n  '));
};

logger.error = function error(message) {
	if (typeof message != 'string') {
		message = JSON.stringify(message, null, '  ');
	}
	console.log(symbols.error + message.replace(/\n/g, '\n  '));
};
