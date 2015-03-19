var cedar = require('../cedar');

function say(s) {
  return s + '_';
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

    is(log.logs.length, 2);
    is(log[0], log.logs[0]);
    is(log[0].transport, 'console');
    is(log[1], log.logs[1]);
    is(log[1].transport, 'base');

    log(1);
    log.debug(2);
    log.trace(3);
    log.log(4);
    log.info(5);
    log.warn(6);
    log.error(7);
    is.in(log[0].stream.write.value, /^1_2_3[\s\S]+_4_5_6_7_$/);
    is.in(log[1].stream.write.value, /^\[1\]_\[2\]_\[3[\s\S]+\]_\[4\]_\[5\]_\[6\]_\[7\]_$/);
  });

});
