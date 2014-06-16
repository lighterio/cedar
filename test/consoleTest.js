var assert = require('assert-plus');
var cedar = require('../cedar');
var write = process.stdout.write;
var cwd = process.cwd();

describe('Console', function () {

  it('should return a console logger', function () {
    var log = cedar();
    assert.equal(log.type, 'console');
    log = cedar('console');
    assert.equal(log.type, 'console');
    log = cedar(['console']);
    assert.equal(log.type, 'console');
  });

  it('should support getPrefixes and setPrefixes', function () {
    var log = cedar();
    log.setPrefixes(0);
    var prefixes = log.getPrefixes();
    assert.equal(prefixes, 0);
  });

  it('should have all of the expected logging functions', function () {
    var log = cedar();
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
    var log = cedar();
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
    assert.equal(output, '{\n  "ok": true\n }\n');

    process.stdout.write = write;
  });

  it('should support log levels', function () {
    var log = cedar();
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
    var log = cedar();
    var output = '';
    process.stdout.write = function (value) {
      output += value;
    };
    log.setFormat(function (message, type) {
      return 'L'+ message + type;
    });
    log.setFormat(function (message, type) {
      return 'E' + message + type + '!';
    }, 'error');
    log(1);
    log.error(2);
    assert.equal(output, 'L1log\nE2error!\n');

    process.stdout.write = write;
  });

  it('should format stack traces', function () {
    var log = cedar();
    var output = '';
    process.stdout.write = function (value) {
      output += value;
    };
    try {
      process.omgWtfBbq();
    }
    catch (e) {
      log.error(e);
    }
    assert.equal(output.indexOf(cwd), -1);
    process.stdout.write = write;
  });

  it('should work when the file is missing', function () {
    var log = cedar();
    var output = '';
    process.stdout.write = function (value) {
      output += value;
    };
    log.before = 12;
    var message = 'Error in X';
    for (var i = 0; i < 15; i++) {
      message += '\n    at X (' + cwd + '/x.js:1:2)';
    }
    log.warn(message);
    message = 'Error in X';
    for (i = 0; i < 15; i++) {
      message += '\n    at X (' + cwd + '/cedar.js:1:2)';
    }
    log.warn(message);
    process.stdout.write = write;
  });
});
