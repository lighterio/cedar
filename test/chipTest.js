var assert = require('assert-plus');
var chip = require('../chip');

require('zeriousify').test();

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
		log.trace('trace');
		log.debug('debug');
		log.log('log');
		log.info('info');
		log.warn('warn');
		log.error('error');

		var write = process.stdout.write;
		process.stdout.write = function () {};
		log('log');
		log({type: 'json', formatted: 'true'});
		log.trace({});
		log.debug({});
		log.log({});
		log.info({});
		log.warn({});
		log.error({});
		process.stdout.write = write;
	});

	it('should support jsonSpace', function () {
		var log = chip();
		var write = process.stdout.write;
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
		var write = process.stdout.write;
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
		assert.equal(output, '\u001b[31merror!\u001b[39m\n');

		log.setLevel('warn');
		log.warn('warn');
		log.info('info');
		assert.equal(output, '\u001b[33mwarn!\u001b[39m\n');

		log.setLevel('info');
		log.info('info');
		log.log('log');
		assert.equal(output, 'info!\n');

		log.setLevel('log');
		log.log('log');
		log.debug('debug');
		assert.equal(output, 'log!\n');

		log.setLevel('debug');
		log.debug('debug');
		log.trace('trace');
		assert.equal(output, 'debug!\n');

		log.setLevel('trace');
		log.trace('trace');
		assert.equal(output, 'trace!\n');
		log.trace('debug');
		assert.equal(output, 'debug!\n');

		log.setLevel('HODOR');
		assert.equal(output, '\u001b[33mUnknown log level: \"HODOR\".!\u001b[39m\n');

		process.stdout.write = write;
	});
});
