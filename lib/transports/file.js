var fs = require('fs');
var os = require('os');
var cluster = require('cluster');
var dirname = require('path').dirname;
var mkdirp = require('../mkdirp');
var Base = require('./base');
var Emitter = require('../emitter');
var QueueStream = require('../queue-stream');

/**
 * The `File` logger writes log messages to disk.
 */
var File = module.exports = function (config) {

  // Create a file logger.
  var logger = Base(config, File.defaults);

  // Add EventEmitter-like methods.
  Emitter.extend(logger);

  // Detect the duration from the path pattern.
  logger.path.replace(/\$\{(DD|HH|NN)\}/, function (match, token) {
    logger.duration = Math.min(File.durations[token], logger.duration);
  });

  // Until an actual stream is open, push `stream.write` arguments to a queue.
  logger.stream = logger.queue = new QueueStream();

  // Open a stream.
  logger.open();

  return logger;

};

/**
 * Set up `File` logger defaults.
 */
File.defaults = Base.decorate({

  // Don't pretty-print JSON.
  space: '',

  // Log to the current directory's "log" directory.
  path: 'log/cedar.log',

  // Open write streams in append mode.
  streamOptions: {flags: 'a'},

  // Write a timestamped message.
  format: function (message, type, prefix) {
    return prefix + (new Date()).toISOString() + ' ' + message + '\n';
  },

  // A start time in the past will trigger a new file.
  start: 0,

  // By default, a file won't rotate.
  duration: Infinity,

  // Open a write stream, if the time is right.
  open: function () {
    var self = this;
    var path = self.path;
    // If the file is set to rotate, check the time.
    if (self.duration) {
      var now = Date.now();
      var elapsed = now % self.duration;
      var start = now - elapsed;
      // If we're in a new time period, get the path.
      if (start > self.start) {
        path = File.getPath(path);
      }
      // Otherwise, schedule a time check at the start of the next period.
      else {
        var remaining = self.duration - elapsed;
        self.timer = setTimeout(function () {
          self.open();
        }, remaining);
        return;
      }
    }
    // Ensure the directory exists, and create the file stream.
    var dir = dirname(path);
    mkdirp(dir, function (error) {
      if (error) {
        throw error;
      }
      // End the existing stream.
      self.stream.end();
      self.stream = self.queue;
      var stream = fs.createWriteStream(path, self.streamOptions);
      stream.on('open', function () {
        is('open', true);
        self.stream = stream;
        self.queue.pipe(stream);
        self.emit('open', path);
      });
      stream.on('close', function () {
        self.emit('close', path);
      });
    });
  }
}, Base.defaults);

/**
 * Roll by day, hour, or minute.
 */
File.durations = {
  DD: 864e5,
  HH: 36e5,
  NN: 6e4
};

/**
 * Get a new file path based on a path pattern.
 */
File.getPath = function (pathPattern) {
  var iso = (new Date()).toISOString();
  var tokens = /\$\{(YYYY|MM|DD|HH|NN|HOST)\}/g;
  return pathPattern.replace(tokens, function (match, token) {
    return token == 'YYYY' ? iso.substr(0, 4) :
      token == 'MM' ? iso.substr(5, 2) :
      token == 'DD' ? iso.substr(8, 2) :
      token == 'HH' ? iso.substr(11, 2) :
      token == 'NN' ? iso.substr(14, 2) :
      token == 'HOST' ? os.hostname() : token;
  });
};
