var fs = require('fs');
var base = require('./base');
var consoleLogger = require('./console')();
/**
 * File logger writes log messages to disk.
 * options:
 *   directory - string :  where the file would be
 *   prefix - string : something to add to the front of the log files
 *   onNewfile - function : a function to run where a new file is created
 *   consoleLog - boolean : an option to do console logging as well
 */
module.exports = function createFileLogger(options) {
  options = options || {};
  var queuedWrites = [];
  var queueStream = {
    write: function (message) {
      queuedWrites.push(message);
    }
  };
  var onNewFile = (typeof options.onNewFile === "function") ? options.onNewFile : function(){};

  var fileStream;
  var logger = base({
    type: 'file',
    stream: queueStream
  });
  logger.setJsonSpace(null);
  var logMinute;
  var format;
  var minuteChecker = function () {
    var currMinute = Math.floor(Date.now() / 60000);
    if (currMinute > logMinute) {
      // Sub in queue stream, end current stream, start new stream
      logger.stream = queueStream;
      fileStream.end();
      startWriteToFile();

    }
  };
  logger.write = function (message, type) {
    if(options.consoleLog){
      consoleLogger.write(message,type);
    }
    minuteChecker();
    return logger.stream.write(format(message, type) + '\n', null);
  };

  logger.setFormat = function (value) {
    format = value;
  };

  logger.setFormat(function (message, type) {
    return JSON.stringify([new Date(), type, message]);
  });
  logger.setOnNewFile = function(newFun){
    onNewFile = newFun;
  };
  function createStream(path) {
    fileStream = fs.createWriteStream(path, {
      flags: 'a'
    });
    fileStream.on('error', function (e) {
      console.error(e);
    });
    logger.stream = fileStream;
    queuedWrites.forEach(function (data) {
      logger.stream.write(data);
    });
    queuedWrites = [];
    var splitted = path.split("/");
    onNewFile(splitted.pop());

  }

  function getFileName(time) {
    if (!time) {
      return (new Date()).toISOString().slice(0, 16).replace('T', '-');
    } else {
      return (new Date(time)).toISOString().slice(0, 16).replace('T', '-');
    }
  }

  function getPathName(time) {
    var directory = ((options.directory ? options.directory + '/' : '') +
        (options.prefix ? options.prefix : '')) || process.cwd() +
      '/logs/cedar-';
    return directory + getFileName(time) + '.log';
  }

  function startWriteToFile() {
    var path = getPathName();
    logMinute = Math.floor(Date.now() / 60000);
    fs.exists(path, function (exists) {
      if (exists) {
        createStream(path);
      } else {
        function writePart(done) {
          directory += '/' + parts.shift();
          fs.mkdir(directory, function madeDirForAssetWrite(err) {
            if (parts.length) {
              writePart(done);
            } else {
              var path = directory + '/' + filename;
              done();
            }
          });
        }
        var parts = path.split('/');
        var filename = parts.pop();
        var directory = '' + parts.shift();
        writePart(function () {
          createStream(path);
        });
      }
    });
  }
  startWriteToFile();
  return logger;
};
