var cedar = require('../cedar');
var write = process.stdout.write;

describe('Base logger', function () {

  it('should have all of the expected logging functions', function () {
    var log = cedar('base');
    var output = '';
    process.stdout.write = function (value) {
      output += value;
    };
    log(1);
    log.trace(2);
    log.debug(3);
    log.log(4);
    log.info(5);
    log.warn(6);
    log.error(7);
    is(output, 'LOG [1]\nTRACE [2]\nDEBUG [3]\nLOG [4]\nINFO [5]\nWARN [6]\nERROR [7]\n');
    process.stdout.write = write;
  });

  // Run tests that are compatible with both stream and color stringify.
  describe('stringify', function () {

    // Create a stream logger that all of the stringify tests can use.
    var log = cedar('base');

    // Run the tests.
    require('./stringifyTest')(log, log.stringify);

  });
});
