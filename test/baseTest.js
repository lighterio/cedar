var assert = require('assert-plus');
var cedar = require('../cedar');
var write = process.stdout.write;

describe('Base', function () {

  var log = cedar('base');

  it('should have all of the expected logging functions', function () {
    var output = '';
    process.stdout.write = function (value) {
      output += value;
    };
    log('1');
    log.trace('2');
    log.debug('3');
    log.log('4');
    log.info('5');
    log.warn('6');
    log.error('7');
    assert.equal(output, 'LOG: 1\nTRACE: 2\nDEBUG: 3\nLOG: 4\nINFO: 5\nWARN: 6\nERROR: 7\n');
    process.stdout.write = write;
  });

  it('should stringify nulls', function () {
    log.setJsonSpace('  ');
    var text = log.stringify(null);
    assert.equal(text, 'null');
  });

  it('should stringify undefined', function () {
    var o = {};
    var text = log.stringify(o.a);
    assert.equal(text, "undefined");
  });

  it('should stringify undefined properties', function () {
    var o = {};
    o.a = o.b;
    var text = log.stringify(o);
    assert.equal(text, "{a: undefined}");
  });

  it('should stringify booleans', function () {
    log.setJsonSpace('  ');
    var text = log.stringify(true);
    assert.equal(text, 'true');
  });

  it('should stringify numbers', function () {
    log.setJsonSpace('  ');
    var text = log.stringify(1);
    assert.equal(text, '1');
  });

  it('should stringify strings', function () {
    var text = 'hi';
    assert.equal(text, "hi");
  });

  it('should stringify functions', function () {
    log.setJsonSpace('  ');
    var text = log.stringify(function(){hi();});
    assert.equal(text, "function (){hi();}");
  });

  it('should stringify function properties', function () {
    log.setJsonSpace('  ');
    var text = log.stringify({f:function(){hi();}});
    assert.equal(text, "{f: [Function]}");
  });

  it('should stringify tight function declarations', function () {
    log.setJsonSpace(null);
    var text = log.stringify(function(){hi();});
    assert.equal(text, "function(){hi();}");
  });

  it('should stringify dates', function () {
    log.setJsonSpace('  ');
    var text = log.stringify(new Date(1402897046851));
    assert.equal(text, "Mon, 16 Jun 2014 05:37:26 GMT");
  });

  it('should stringify objects', function () {
    Object.prototype.testHasOwnProperty = function () {};
    log.setJsonSpace('  ');
    var text = log.stringify({ok: true});
    assert.equal(text, "{ok: true}");
  });

  it('should stringify circular objects', function () {
    log.setJsonSpace('  ');
    var a = {};
    a.b = {};
    a.b.a = a;
    var text = log.stringify(a);
    assert.equal(text, "{b: {a: [Circular]}}");
  });

  it('should stringify arrays', function () {
    log.setJsonSpace('  ');
    var a = [1, 2, 3];
    var text = log.stringify(a);
    assert.equal(text, "[1, 2, 3]");
  });

  it('should stringify reserved words', function () {
    log.setJsonSpace('  ');
    var o = {'do': 'there is no try'};
    var text = log.stringify(o);
    assert.equal(text, '{"do": "there is no try"}');
  });

  it('should stringify large objects', function () {
    log.setJsonSpace('  ');
    var text = 'This string will cause stringify to include line breaks.';
    var string = log.stringify({a: text, b: text});
    assert.equal(string, '{\n  a: "' + text + '",\n  b: "' + text + '"\n}');
  });

  it('should stringify to a maximum depth', function () {
    log.setJsonSpace(null);
    var a = {b: {c: {d: {e: {f: {}}}}}};
    var text = log.stringify(a);
    assert.equal(text, '{b:{c:{d:{e:{f:[Object]}}}}}');
    a = [[[[[[]]]]]];
    text = log.stringify(a);
    assert.equal(text, '[[[[[[Array]]]]]]');
  });


});
