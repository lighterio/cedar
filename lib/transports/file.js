var fs = require('fs')
var dirname = require('path').dirname
var os = require('os')
var spawn = require('child_process').spawn
var Base = require('./base')
var mkdirp = require('../../common/fs/mkdirp')
var QueueStream = require('../queue-stream')
var Emitter = require('../../common/event/emitter')

/**
 * The `File` log writes log messages to disk.
 */
var File = module.exports = function (config) {

  // Create a file log.
  var log = Base(config, File.defaults)

  // Add emitter methods.
  Emitter.decorate(log)

  // Detect the duration from the path pattern.
  log.path.replace(/\$\{(DD|HH|NN|SS)\}/g, function (match, token) {
    log.duration = Math.min(File.durations[token], log.duration)
  })

  // Until an actual stream is open, push `stream.write` arguments to a queue.
  log.stream = log.queue = new QueueStream()

  // Open a stream.
  var isRotating = (log.duration < Infinity)
  log[isRotating ? 'checkTime' : 'openStream'].apply(log)

  return log

}

/**
 * Set up `File` log defaults.
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
    return prefix + timestamp() + ' ' + message.replace(/\n/g, '\\n') + '\n'
  },

  // A start time in the past will trigger a new file.
  currentFileStartTime: 0,

  // By default, a file won't rotate.
  duration: Infinity,

  // Close the file stream, and cancel future timeouts.
  close: function () {
    var self = this
    clearTimeout(self.timer)
    self.isClosed = true
    self._events = 0
    self.on('open', function () {
      self.close()
      self._events = 0
    })
  },

  // Check to see if it's time to open a new stream.
  checkTime: function () {
    var self = this

    var now = Date.now()
    var elapsed = now % self.duration
    var start = now - elapsed

    // If we're in a new time period, open a new stream.
    if (start > self.currentFileStartTime) {
      // Enter the new time period.
      self.currentStart = start
      // Open a write stream.
      self.openStream()
    }

    // Check again later.
    var remaining = self.duration - elapsed
    self.timer = setTimeout(function () {
      self.checkTime()
    }, remaining)

  },

  // Create a write stream.
  openStream: function () {
    var self = this
    var path = File.getPath(self.path)

    // Ensure the directory exists, and create the file stream.
    var dir = dirname(path)
    mkdirp(dir, function (error) {
      if (error) {
        throw error
      }
      if (self.isClosed) {
        return
      }

      // End the existing stream.
      self.stream.end()

      // Queue `write` arguments until the new stream is open.
      self.stream = self.queue

      // Open the new stream.
      try {
        var stream = fs.createWriteStream(path, self.streamOptions)
      } catch (e) {
        self.emit('error', e)
      }

      // Once open, pipe queued writes in, then emit an "open" event.
      stream.on('open', function () {
        self.stream = stream
        self.queue.pipe(stream)
        self.currentFile = path
        self.emit('open', path)
      })

      // When closed, emit a "close" event.
      stream.on('close', function () {
        self.emit('close', path)
        if (typeof self.after === 'function') {
          self.after(path)
        } else if (typeof self.after === 'string') {
          var cmds = self.after.replace(/\$\{PATH\}/g, path).split(';')
          var run = function (index) {
            var args = cmds[index].split(/\s+/)
            var cmd = args.shift()
            cmd = spawn(cmd, args)
            cmd.on('error', function (error) {
              self.error(error)
            })
            cmd.on('exit', function (error) {
              if (++index < cmds.length) {
                run(index)
              }
            })
          }
          run(0)
        }
      })
    })
  }
}, Base.defaults)

/**
 * Roll by day, hour, or minute.
 */
File.durations = {
  DD: 864e5,
  HH: 36e5,
  NN: 6e4,
  SS: 1e3
}

/**
 * Get a new file path based on a path pattern.
 */
File.getPath = function (pathPattern) {
  var stamp = timestamp()
  var tokens = /\$\{(YYYY|MM|DD|HH|NN|SS|HOST)\}/g
  return pathPattern.replace(tokens, function (match, token) {
    return token === 'YYYY' ? stamp.substr(0, 4) :
      token === 'MM' ? stamp.substr(5, 2) :
      token === 'DD' ? stamp.substr(8, 2) :
      token === 'HH' ? stamp.substr(11, 2) :
      token === 'NN' ? stamp.substr(14, 2) :
      token === 'SS' ? stamp.substr(17, 2) :
      token === 'HOST' ? os.hostname() : token
  })
}

/**
 * Get an ISO date string as a timestamp.
 */
function timestamp () {
  return (new Date()).toISOString()
}
