var assert = require('assert-plus');
var chip = require('../chip');
var write = process.stdout.write;

require('zeriousify').test();

describe('Blackhole', function () {

	it('should have all of the expected logging functions', function () {
		var log = chip('blackhole');
		log('log');
		log.trace('trace');
		log.debug('debug');
		log.log('log');
		log.info('info');
		log.warn('warn');
		log.error('error');
	});

});

describe('Console', function () {

	it('should return a console logger', function () {
		var log = chip();
		assert.equal(log.type, 'console');
		log = chip('console');
		assert.equal(log.type, 'console');
		log = chip(['console']);
		assert.equal(log.type, 'console');
	});
	it('should support getPrefixes and setPrefixes', function () {
		var log = chip();
		log.setPrefixes(0);
		var prefixes = log.getPrefixes();
		assert.equal(prefixes, 0);
	});
	it('should have all of the expected logging functions', function () {
		var log = chip();
		var prefixes = log.getPrefixes();
		for (var key in prefixes) {
			prefixes[key] = '      ' + prefixes[key];
		}
		log.setPrefixes(prefixes);
		log.debug('debug');
		log.trace('trace');
		log.log('log');
		log.info('info');
		log.warn('warn');
		log.error('error');

		process.stdout.write = function () {};
		log('log');
		log({type: 'json', formatted: 'true'});
		log.debug({});
		log.trace({});
		log.log({});
		log.info({});
		log.warn({});
		log.error({});
		process.stdout.write = write;
	});

	it('should support jsonSpace', function () {
		var log = chip();
		var output = null;
		process.stdout.write = function (value) {
			output = value;
		};

		log.setPrefixes({log: ''});

		log.setFormat(function (message) {
			return message;
		});

		log.setJsonSpace(null);
		log({ok: true});
		assert.equal(output, '{"ok":true}\n');

		log.setJsonSpace(' ');
		log({ok: true});
		assert.equal(output, '{\n "ok": true\n}\n');

		process.stdout.write = write;
	});

	it('should support log levels', function () {
		var log = chip();
		var output = null;
		process.stdout.write = function (value) {
			output = value;
		};

		log.setPrefixes({error: '', warn: '', info: '', log: '', debug: '', trace: ''});

		log.setFormat(function (message) {
			return message + '!';
		});

		log.setLevel('nothing');
		log.trace('meh');
		assert.equal(output, null);

		log.setLevel('error');
		log.error('error');
		log.warn('warn');
		assert.equal(output, 'error!\n');

		log.setLevel('warn');
		log.warn('warn');
		log.info('info');
		assert.equal(output, 'warn!\n');

		log.setLevel('info');
		log.info('info');
		log.log('log');
		assert.equal(output, 'info!\n');

		log.setLevel('log');
		log.log('log');
		log.debug('trace');
		assert.equal(output, 'log!\n');

		log.setLevel('trace');
		log.trace('trace');
		log.debug('debug');
		assert.equal(output, 'trace!\n');

		log.setLevel('debug');
		log.debug('debug');
		assert.equal(output, 'debug!\n');
		log.trace('trace');
		assert.equal(output, 'trace!\n');

		log.setLevel('HODOR');
		assert.equal(output, 'Unknown log level: \"HODOR\".!\n');

		process.stdout.write = write;
	});

	it('should support custom formats', function () {
		var log = chip();
		var output = '';
		process.stdout.write = function (value) {
			output += value;
		};
		log.setPrefixes({error: 'E', log: 'L'});
		log.setFormat(function (message, prefix, type) {
			return prefix + message + type;
		});
		log.setFormat(function (message, prefix, type) {
			return prefix + message + type + '!';
		}, 'error');
		log(1);
		log.error(2);
		assert.equal(output, 'L1log\nE2error!\n');

		process.stdout.write = write;
	});

	it('should format stack traces', function () {
		var log = chip();
		var output = '';
		process.stdout.write = function (value) {
			output += value;
		};
		var err = 'Error: blah\n' +
			'  at blah (' + process.cwd() + '/blah.js:1:2)\n' +
			'  at blahblah (' + process.cwd() + '/blah.js:15:2)\n' +
			'  at TCP.onread (net.js:527:27)'.length;

		log.error(err);
		assert.equal(output.indexOf(process.cwd()), -1);

		process.stdout.write = write;
	});
});
