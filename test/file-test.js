var cedar = require('../cedar')
var os = require('os')
var fs = require('fs')
var mock = require('exam/lib/mock')
var cwd = process.cwd()

function mockIt () {
  mock.time(1412637494591)
  mock.cpu({
    isMaster: true,
    cpus: 1,
    fork: false,
    hostname: 'me'
  })
}

function unmockIt () {
  unmock.time()
  unmock.cpu()
}

describe('File', function () {

  it('logs to the default path', function (done) {
    var log = cedar('file')
    is(log.path, 'log/cedar.log')
    log('log')
    log({})
    log(0)
    log(null)
    log([].undef)
    log.close()
    done()
  })

  it('logs to a specified path', function (done) {
    var path = 'log/path/file.log'
    var log = cedar('file', {path: path})
    is(log.path, path)
    log('HELLO!')
    log.on('open', function () {
      log('WORLD!')
      log.stream.end()
    })
    log.on('close', function () {
      var content = fs.readFileSync(path)
      is.in(content.toString(), 'HELLO!')
      is.in(content.toString(), 'WORLD!')
      log.close()
      done()
    })
  })

  it('logs to a pattern path', function (done) {
    mockIt()
    var pattern = 'log/${YYYY}/${MM}/${DD}/data-${HOST}.log'
    var expectedPath = 'log/2014/10/06/data-me.log'
    var log = cedar('file', {path: pattern})
    log.warn('PATTERNED!')
    log.on('open', function (path) {
      is(path, expectedPath)
      log.stream.end()
    })
    log.on('close', function (path) {
      var content = fs.readFileSync(expectedPath)
      is.in(content.toString(), 'PATTERNED!')
      log.close()
      unmockIt()
      done()
    })
  })

  it('rotates by minute', function (done) {
    mockIt()
    var pattern = 'log/${YYYY}/${MM}/${DD}/data-${HH}:${NN}-${HOST}.log'
    var n = 0
    var content
    var log = cedar('file', {path: pattern})
    log.on('open', function (path) {
      log.info('OPEN' + (++n))
      setTimeout(function () {
        if (n === 1) {
          is(path, 'log/2014/10/06/data-23:18-me.log')
          mock.time.add(6e4)
        } else if (n === 2) {
          is(path, 'log/2014/10/06/data-23:19-me.log')
          mock.time.add(6e4)
        }
      }, 0)
    })
    log.on('close', function (path) {
      if (n === 2) {
        content = '' + fs.readFileSync('log/2014/10/06/data-23:18-me.log')
        is.in(content, 'START')
        is.in(content, 'OPEN1')
        content = '' + fs.readFileSync('log/2014/10/06/data-23:19-me.log')
        is.in(content, 'OPEN2')
        setTimeout(function () {
          log.close()
          unmockIt()
          done()
        }, 0)
      }
    })
    log('START')
  })

})
