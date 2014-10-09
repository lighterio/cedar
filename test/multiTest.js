var cedar = require('../cedar');

function say(s) {
  return s + '.';
}

function mockStream() {
  return {write: mock.concat()};
}

describe('Multi', function () {

  it('should log to color and base', function () {

    var log = cedar([
      {transport: 'console', format: say, stream: mockStream()},
      {transport: 'base', format: say, stream: mockStream()}
    ]);

    is(log.loggers.length, 2);
    is(log[0], log.loggers[0]);
    is(log[0].transport, 'console');
    is(log[1], log.loggers[1]);
    is(log[1].transport, 'base');

    log(1);
    log.debug(2);
    log.trace(3);
    log.log(4);
    log.info(5);
    log.warn(6);
    log.error(7);
    is(log[0].stream.write.value, '1.2.3.4.5.6.7.');
    is(log[1].stream.write.value, '[1].[2].[3].[4].[5].[6].[7].');
  });

});
