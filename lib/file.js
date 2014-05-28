var fs = require('fs');
var base = require('./base');

/**
 * File logger writes log messages to disk.
 */
module.exports = function createFileLogger(options) {

  var options = options || {};
  var queuedWrites = [];
  var logger = base({type: 'file', stream: {
    write: function (message) {
      queuedWrites.push(message);
    }
  }});

  logger.setJsonSpace(null);

  var format;

  logger.write = function (message, type) {
    return logger.stream.write(format(message, type) + '\n');
  };

  logger.setFormat = function (value) {
    format = value;
  };

  logger.setFormat(function(message, type) {
    return JSON.stringify([new Date(), type, message]);
  });

  function createStream(path) {
    logger.stream = fs.createWriteStream(path, {flags: 'a'});
    queuedWrites.forEach(function (data) {
      logger.stream.write(data);
    });
    delete queuedWrites;
  }

  var path = options.path || process.cwd() + '/logs/cedar.log';
  fs.exists(path, function(exists) {

    if (exists) {
      createStream(path);
    }

    else {

      var parts = path.split('/');
      filename = parts.pop();
      directory = '' + parts.shift();

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

      writePart(function () {
        createStream(path);
      });

    }
  });

  return logger;

};
