var cluster = require('cluster')
var crypto = require('crypto')
var cedar = require('../../cedar')
var Base = require('./base')
var scriptify = require('../../common/json/scriptify')
var evaluate = require('../../common/json/evaluate')

/**
 * The `Multi` log logs to an array of logs.
 */
var Multi = module.exports = function (logs) {

  // Give the log an ID based on its configuration, and register it.
  var json = JSON.stringify(logs)
  var hash = crypto.createHash('md5').update(json).digest('hex')
  var id = 'CEDAR_' + hash.substr(0, 8)

  var log

  // In the master process, log to each transport.
  if (cluster.isMaster) {

    // The multi log is a "log" function alias, like all other Cedar logs.
    log = function () {
      for (var i = 0, l = logs.length; i < l; i++) {
        var item = log[i]
        item.apply(item, arguments)
      }
    }

    // Set the array of logs as a property.
    log.logs = logs

    // Instantiate a Cedar log for each item in the array.
    logs.forEach(function (item, i) {
      if (typeof item === 'string') {
        item = {transport: item}
      } else if (!item.transport) {
        item.transport = 'console'
      }
      log[i] = logs[i] = cedar(item.transport, item)
    })

    // Set up all logging methods.
    Base.levels.forEach(function (methodName) {
      log[methodName] = function () {
        for (var i = 0, l = logs.length; i < l; i++) {
          var item = log[i]
          item[methodName].apply(item, arguments)
        }
      }
    })

    // Register the log in the `Multi` map so workers can reach it.
    Multi[id] = log

  // In worker processes, send log messages to the master.
  } else {

    // Send a log message.
    log = function () {
      var args = Array.prototype.slice.call(arguments)
      process.send(log.id + 'log' + scriptify(args))
    }

    // Set up all logging methods.
    Base.levels.forEach(function (methodName) {
      log[methodName] = function () {
        var args = Array.prototype.slice.call(arguments)
        process.send(log.id + methodName + scriptify(args))
      }
    })

  }

  // Self identify as a Multi log.
  log.transport = 'multi'
  log.id = id
  log.logs = logs

  return log

}

// Listen for messages from workers.
if (cluster.isMaster) {
  cluster.on('listening', function (worker) {
    var receive = function (message) {
      var id = message.substr(0, 14)
      var pos = message.indexOf('[')
      var type = message.substring(14, pos)
      var data = message.substring(pos)
      data = evaluate(data)
      var log = Multi[id]
      if (log) {
        var logs = log.logs
        for (var i = 0, l = logs.length; i < l; i++) {
          var item = log[i]
          if (!item.worker || (item.worker === worker.id)) {
            try {
              item[type].apply(item, data)
            } catch (e) {
            }
          }
        }
      }
    }
    var alreadyListening = false
    worker.listeners('message').forEach(function (listener) {
      if (listener.toString() === receive.toString()) {
        alreadyListening = true
      }
    })
    if (!alreadyListening) {
      worker.on('message', receive)
    }
  })
}
