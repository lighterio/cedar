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
	it('should have all of the expected functions', function () {
		var log = chip();
		log('log');
		log({type: 'json', formatted: 'true'});
		log.debug('debug');
		log.debug({});
		log.trace('trace');
		log.trace({});
		log.log('log');
		log.log({});
		log.info('info');
		log.info({});
		log.warn('warn');
		log.warn({});
		log.error('error');
		log.error({});
	});
});
