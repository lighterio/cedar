var assert = require('assert-plus');
var cedar = require('../cedar');

describe('Blackhole', function () {

  it('should have all of the expected logging functions', function () {
    var log = cedar('blackhole');
    log('log');
    log.trace('trace');
    log.debug('debug');
    log.log('log');
    log.info('info');
    log.warn('warn');
    log.error('error');
  });

});
