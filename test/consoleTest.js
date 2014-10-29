var cedar = require('../cedar');
var write = process.stdout.write;
var cwd = process.cwd();
var out;

describe('Console', function () {

  // Methods which don't set custom properties can use this default logger.
  var log = cedar();

  beforeEach(function () {
    out = mock.concat();
    mock(process.stdout, {write: out});
  });

  afterEach(function () {
    unmock(process.stdout);
  });

  it('should return a console logger', function () {
    is(log.transport, 'console');
    log = cedar('console');
    is(log.transport, 'console');
    log = cedar(['console']);
    is(log[0].transport, 'console');
  });

  it('should support prefixes', function () {
    var log = cedar();
    log.prefixes = 0;
    var prefixes = log.prefixes;
    is(prefixes, 0);
  });

  it('should have all of the expected logging functions', function () {
    var log = cedar();
    var prefixes = log.prefixes;
    mock(process.stdout, {
      write: function () {}
    });

    log.prefixes = prefixes;
    log.debug('debug');
    log.trace('trace');
    log.log('log');
    log.info('info');
    log.warn('warn');
    log.error('error');

    log('log');
    log({type: 'json', formatted: 'true'});
    log.debug({});
    log.trace({});
    log.log({});
    log.info({});
    log.warn({});
    log.error({});

    unmock(process.stdout);
  });

  it('should support win32', function () {
    mock(process, {
      platform: 'win32'
    });
    var log = cedar();
    var prefixes = log.prefixes;

    log.prefixes = prefixes;
    log.debug('debug');
    log.trace('trace');
    log.log('log');
    log.info('info');
    log.warn('warn');
    log.error('error');
    unmock(process);
    unmock(process.stdout);
  });

  it('should support log levels', function () {
    var log = cedar();

    log.format = function (message) {
      return message + '!';
    };

    out.value = '';
    log.level = 'nothing';
    log.trace('meh');
    is(out.value, '');

    out.value = '';
    log.level = 'error';
    log.error('error');
    log.warn('warn');
    is(out.value, 'error!');

    out.value = '';
    log.level = 'warn';
    log.warn('warn');
    log.info('info');
    is(out.value, 'warn!');

    out.value = '';
    log.level = 'info';
    log.info('info');
    log.log('log');
    is(out.value, 'info!');

    out.value = '';
    log.level = 'log';
    log.log('log');
    log.trace('debug');
    is(out.value, 'log!');

    out.value = '';
    log.level = 'debug';
    log.debug('debug');
    log.trace('trace');
    is(out.value, 'debug!');

    out.value = '';
    log.level = 'trace';
    log.trace('trace');
    is.in(out.value, 'trace');

    out.value = '';
    log.debug('debug');
    is(out.value, 'debug!');

    out.value = '';
    log.level = 'HODOR';
    is(out.value, 'Unknown log level: \"HODOR\".!');
  });

  it('should format stack traces', function () {
    try {
      process.omgWtfBbq();
    }
    catch (e) {
      log.error(e);
    }
    is(out.value.indexOf(cwd), -1);
  });

  it('should support error formatting with missing source files', function () {
    var log = cedar();
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
  });

  it('should move bracketed names to the end', function () {
    function pretty(text) {
      text = text.replace(/</g, '\u001b[90m').replace(/>/g, '\u001b[39m');
      return text.replace(/@/g, '\u279C');
    }
    var log = cedar();
    log('[Ok] Blah');
    is(out.value, pretty('<@ >Blah' + Array(log.bracketStart - 4).join(' ') + '<Ok>\n'));
    out.value = '';
    log(pretty('[Ok] Hi <(1)>'));
    is(out.value, pretty('<@ >Hi <(1)>' + Array(log.bracketStart - 6).join(' ') + '<Ok>\n'));
  });

  // Run tests that are compatible with both base and console stringify.
  describe('stringify', function () {

    // Create a console logger that all of the stringify tests can use.
    var log = cedar();

    // Stringify and un-color to match base logger stringify.
    var colorlessStringify = function (data) {
      return log.stringify(data).replace(/\u001b\[\d\dm/g, '');
    };

    // Run the tests.
    require('./stringifyTest')(log, colorlessStringify);

  });
});
