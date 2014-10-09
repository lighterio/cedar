var cedar = require('../cedar');
var os = require('os');
var cluster = require('cluster');
var fs = require('fs');
var need = [
  'cedar.js',
  'lib/emitter.js',
  'lib/mkdirp.js',
  'lib/queue-stream.js',
  'lib/stringify.js',
  'lib/transports/base.js',
  'lib/transports/file.js',
  'node_modules/exam/lib/is.js'
];
need.forEach(function (path) {
  need[path] = fs.readFileSync(path);
});

describe('File', function () {

  beforeEach(function () {
    mock.fs(need);
    mock(Date.prototype, {
      getTime: function () {
        return 1412637494591;
      },
      toISOString: function () {
        return '2014-10-06T23:18:14.591Z';
      }
    });
    mock(os, {
      hostname: function () {
        return 'me';
      }
    });
  });

  it('logs to the default path', function(done) {
    var log = cedar('file');
    is(log.path, 'log/cedar.log');
    log('log');
    log({});
    log(0);
    log(null);
    log([].undef);
    done();
  });

  it('logs to a specified path', function (done) {
    var path = 'log/path/file.log';
    var log = cedar('file', {path: path});
    log('HELLO!');
    log.on('open', function () {
      log('WORLD!');
      log.stream.end();
    });
    log.on('close', function () {
      var content = fs.readFileSync(path);
      is.in(content.toString(), 'HELLO!');
      is.in(content.toString(), 'WORLD!');
      done();
    });
  });

  it('logs to a pattern path', function (done) {
    var pattern = 'log/YYYY/MM/DD/HH:NN:SS-HOST-WORKER.log';
    var expectedPath = 'log/2014/10/06/23:18:14-me-master.log';
    var log = cedar('file', {pattern: pattern});
    log.warn('PATTERNED!');
    log.on('open', function (path) {
      is(path, expectedPath);
      log.stream.end();
    });
    log.on('close', function () {
      var content = fs.readFileSync(expectedPath);
      is.in(content.toString(), 'PATTERNED!');
      done();
    });
  });

  it('logs to a pattern as a worker', function (done) {
    mock(cluster, {
      isMaster: false,
      worker: {id: 2}
    });
    var pattern = 'log/YYYY/MM/DD/HH:NN:SS-HOST-WORKER.log';
    var expectedPath = 'log/2014/10/06/23:18:14-me-worker2.log';
    var log = cedar('file', {pattern: pattern});
    log.warn('PATTERNED!');
    log.on('open', function (path) {
      is(path, expectedPath);
      done();
    });
  });

  it('rotates on an interval');

  it('zips when finished');

  afterEach(function () {
    unmock(fs);
    unmock(Date.prototype);
    unmock(os);
    unmock(cluster);
  });

});
