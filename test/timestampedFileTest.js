var fs = require('fs');
var cedar = require('../cedar');

describe('Timestamped File', function () {

  it('should log to file', function (done) {
    var log = cedar('timestampedFile');
    log('log');
    log({});
    log(0);
    log(null);
    log([].undef);
    setTimeout(function() {
      log = cedar('timestampedFile', {
        directory: 'logs/deleteMeTimestampedTest',
        prefix: 'test-'
      });
      log('exists');

      setTimeout(function() {
        log = cedar('timestampedFile', {
          directory: 'logs/deleteMeTimestampedTest',
          prefix: 'test-'
        });
        log("test test");
        setTimeout(function() {
          var fileArray = fs.readdirSync("logs/deleteMeTimestampedTest");
          for (var i = 0, len = fileArray.length; i < len; i++) {
            fs.unlinkSync("logs/deleteMeTimestampedTest/" + fileArray[i]);
          }
          fs.rmdirSync("logs/deleteMeTimestampedTest");
          done();
        }, 20);
      }, 20);
    }, 100);
  });

  it('should create a new file every minute', function (done) {
    this.timeout(2 * 60 * 1000);
    var log = cedar('timestampedFile', {
      directory: "logs/deleteMe_minuteTest",
      consoleLog: true
    });
    log('this goes in file1');
    setTimeout(function() {
      log('this goes in file2');
      setTimeout(function() {
        var fileArray = fs.readdirSync("logs/deleteMe_minuteTest");
        is(fileArray.length, 2);
        fs.unlinkSync("logs/deleteMe_minuteTest/" + fileArray[1]);
        fs.unlinkSync("logs/deleteMe_minuteTest/" + fileArray[0]);
        fs.rmdirSync("logs/deleteMe_minuteTest");
        done();
      }, 100);
    }, 60 * 1000);
  });

  it('should fire a callback on new file', function (done) {
    this.timeout(2 * 60 * 1000);
    var log = cedar('timestampedFile', {
      onNewFile: function() {
        log("logging from the new file callback!");
      },
      directory: 'logs/deleteMe_onNewFileTest'
    });
    log.setOnNewFile(function(){
      log("logging from the new file callback 2!");
    });
    log('I go in to file1');
    setTimeout(function() {
      log('I go in to file 2');
      setTimeout(function() {
        var fileArray = fs.readdirSync("logs/deleteMe_onNewFileTest");
        console.log(fileArray);
        is(fileArray.length, 2);
        var contents = fs.readFileSync("logs/deleteMe_onNewFileTest/" + fileArray[1], {
          encoding: "utf8"
        });
        console.log(typeof contents);
        contents = contents.split("\n");
        var parsed = [];
        parsed[0] = JSON.parse(contents[0]);
        parsed[1] = JSON.parse(contents[1]);
        is(parsed[0][2]["0"], 'I go in to file 2');
        is(parsed[1][2]["0"], 'logging from the new file callback 2!');
        fs.unlinkSync("logs/deleteMe_onNewFileTest/" + fileArray[1]);
        fs.unlinkSync("logs/deleteMe_onNewFileTest/" + fileArray[0]);
        fs.rmdirSync("logs/deleteMe_onNewFileTest");
        done();

      }, 100);
    }, 60 * 1000);
  });

});
