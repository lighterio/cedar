var assert = require('assert-plus');
var cedar = require('../cedar');
var write = process.stdout.write;

describe('Base', function () {

  it('should have all of the expected logging functions', function () {
    var log = cedar('base');
    var output = '';
    process.stdout.write = function (value) {
      output += value;
    };
    log('1');
    log.error('2');
    assert.equal(output, 'LOG: 1\nERROR: 2\n');
    process.stdout.write = write;
  });

  it('should stringify', function () {
    var log = cedar('base');
    log.setJsonSpace('');
    assert.equal(log.stringify({}), '{}');
    var o = {};
    o.o = o;
    o.def = o.undef;
    assert.equal(log.stringify(o), '{"o":"[Circular]","def":"undefined"}');
    assert.equal(log.stringify(function (){}), 'function (){}');
    assert.equal(log.stringify(1), '1');
    assert.equal(log.stringify(true), 'true');
    assert.equal(log.stringify(null), 'null');
    assert.equal(log.stringify(o.undef), 'undefined');
    assert.equal(log.stringify('hello'), 'hello');
  });

});
