var cedar = require('../cedar')
var write = process.stdout.write

describe('Base log', function () {

  it('should have all of the expected logging functions', function () {
    var log = cedar('base')
    var output = ''
    process.stdout.write = function (value) {
      output += value
    }
    log(1)
    log.trace(2)
    log.debug(3)
    log.log(4)
    log.info(5)
    log.warn(6)
    log.error(7)
    is.in(output, /LOG \[1\]\nTRACE \[2[\s\S]+\]\nDEBUG \[3\]\nLOG \[4\]\nINFO \[5\]\nWARN \[6\]\nERROR \[7\]\n/)
    process.stdout.write = write
  })

  // Run tests that are compatible with both stream and color stringify.
  describe('stringify', function () {

    // Create a stream log that all of the stringify tests can use.
    var log = cedar('base')

    // Run the tests.
    require('./stringify-test')(log, log.stringify)

  })
})
