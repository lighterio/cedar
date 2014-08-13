var cedar = require('../cedar');
var write = process.stdout.write;
var cwd = process.cwd();

describe('Console', function () {

  // Methods which don't set custom properties can use this default logger.
  var log = cedar();

  it('should return a console logger', function () {
    is(log.type, 'console');
    log = cedar('console');
    is(log.type, 'console');
    log = cedar(['console']);
    is(log.type, 'console');
  });

  it('should support getPrefixes and setPrefixes', function () {
    var log = cedar();
    log.setPrefixes(0);
    var prefixes = log.getPrefixes();
    is(prefixes, 0);
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

  it('should support win32', function () {
    var originalPlatform = process.platform;
    process.platform = 'win32';
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
    process.platform = originalPlatform;
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
    is(output, null);

    log.setLevel('error');
    log.error('error');
    log.warn('warn');
    is(output, 'error!\n');

    log.setLevel('warn');
    log.warn('warn');
    log.info('info');
    is(output, 'warn!\n');

    log.setLevel('info');
    log.info('info');
    log.log('log');
    is(output, 'info!\n');

    log.setLevel('log');
    log.log('log');
    log.debug('trace');
    is(output, 'log!\n');

    log.setLevel('trace');
    log.trace('trace');
    log.debug('debug');
    is(output, 'trace!\n');

    log.setLevel('debug');
    log.debug('debug');
    is(output, 'debug!\n');
    log.trace('trace');
    is(output, 'trace!\n');

    log.setLevel('HODOR');
    is(output, 'Unknown log level: \"HODOR\".!\n');

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
    is(output, 'L1log\nE2error!\n');

    process.stdout.write = write;
  });

  it('should format stack traces', function () {
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
    is(output.indexOf(cwd), -1);
    process.stdout.write = write;
  });

  it('should support error formatting with missing source files', function () {
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

  it('should move bracketed names to the end', function () {
    var log = cedar();
    var output = '';
    var space = '                                             ';
    process.stdout.write = function (value) {
      output += value;
    };
    function pretty(text) {
      text = text.replace(/</g, '\u001b[90m').replace(/>/g, '\u001b[39m');
      return text.replace(/@/g, '\u279C');
    }
    log('[Ok] Blah');
    is(output, pretty('<@ >Blah' + Array(46).join(' ') + '<Ok>\n'));
    output = '';
    log(pretty('[Ok] Hi <(1)>'));
    is(output, pretty('<@ >Hi <(1)>' + Array(44).join(' ') + '<Ok>\n'));
    process.stdout.write = write;
  });

  // Run tests that are compatible with both base and console stringify.
  describe('stringify', function () {

    // Create a base logger that all of the stringify tests can use.
    var log = cedar();

    // Stringify and un-color to match base logger stringify.
    var colorlessStringify = function (data) {
      return log.stringify(data).replace(/\u001b\[\d\dm/g, '');
    };

    // Run the tests.
    require('./stringifyTest')(log, colorlessStringify);

  });
});
