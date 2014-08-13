var fs = require('fs');
var cedar = require('../cedar');

describe('File', function () {

  it('should log to file', function (done) {
    var log = cedar('file');
    log('log');
    log({});
    log(0);
    log(null);
    log([].undef);
    setTimeout(function () {
      var log = cedar('file');
      log('exists');
      log = cedar('file', {path: 'logs/deleteMe/deleteMe.log'});
      setTimeout(function () {
        fs.unlink('logs/cedar.log');
        fs.unlink('logs/deleteMe/deleteMe.log');
        done();
      }, 100);
    }, 100);
  });

});
