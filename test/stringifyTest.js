var assert = require('assert-plus');

module.exports = function (log, stringify) {

  it('should handle nulls', function () {
    var text = stringify(null);
    assert.equal(text, 'null');
  });

  it('should handle undefined', function () {
    var o = {};
    var text = stringify(o.a);
    assert.equal(text, "undefined");
  });

  it('should handle undefined properties', function () {
    var o = {};
    o.a = o.b;
    var text = stringify(o);
    assert.equal(text, "{a: undefined}");
  });

  it('should handle booleans', function () {
    var text = stringify(true);
    assert.equal(text, 'true');
  });

  it('should handle numbers', function () {
    var text = stringify(1);
    assert.equal(text, '1');
  });

  it('should handle strings', function () {
    var text = 'hi';
    assert.equal(text, "hi");
  });

  it('should handle functions', function () {
    var text = stringify(function(){hi();});
    assert.equal(text, "function (){hi();}");
  });

  it('should handle function properties', function () {
    var text = stringify({f:function(){hi();}});
    assert.equal(text, "{f: [Function]}");
  });

  it('should handle function properties with names', function () {
    var text = stringify({f:function hello(){hi();}});
    assert.equal(text, "{f: [Function: hello]}");
  });

  it('should handle tight function declarations', function () {
    log.setJsonSpace(null);
    var text = stringify(function(){hi();});
    assert.equal(text, "function(){hi();}");
    log.setJsonSpace('  ');
  });

  it('should handle dates', function () {
    var text = stringify(new Date(1402897046851));
    assert.equal(text, "Mon, 16 Jun 2014 05:37:26 GMT");
  });

  it('should handle date properties', function () {
    var text = stringify({start: new Date(1402897046851)});
    assert.equal(text, "{start: [Date: Mon, 16 Jun 2014 05:37:26 GMT]}");
  });

  it('should handle objects', function () {
    Object.prototype.testHasOwnProperty = function () {};
    var text = stringify({ok: true, _underscored: 'private-ish'});
    assert.equal(text, '{ok: true, _underscored: "private-ish"}');
  });

  it('should handle circular objects', function () {
    var a = {};
    a.b = {};
    a.b.a = a;
    var text = stringify(a);
    assert.equal(text, "{b: {a: [Circular]}}");
  });

  it('should handle arrays', function () {
    var a = [1, 2, 3];
    var text = stringify(a);
    assert.equal(text, "[1, 2, 3]");
  });

  it('should handle empty arrays', function () {
    var a = [];
    var text = stringify(a);
    assert.equal(text, "[]");
  });

  it('should handle reserved words', function () {
    var o = {'do': 'there is no try'};
    var text = stringify(o);
    assert.equal(text, '{"do": "there is no try"}');
  });

  it('should handle large objects', function () {
    var text = 'This string will cause stringify to include line breaks.';
    var string = stringify({a: text, b: text});
    assert.equal(string, '{\n  a: "' + text + '",\n  b: "' + text + '"\n}');
  });

  it('should handle noisy deprecated getters', function () {
    var data = {};
    Object.defineProperty(data, 'deprecated', {
      enumerable: true,
      get: function () {
        process.stderr.write('The "deprecated" method is deprecated.');
        return true;
      }
    });
    var string = log.stringifyArguments([data]);
    assert.equal(string.indexOf('true') > 0, true);
  });

  it('should handle to a maximum depth', function () {
    log.setJsonSpace(null);
    var a = {b: {c: {d: {e: {f: {}}}}}};
    var text = stringify(a);
    assert.equal(text, '{b:{c:{d:{e:{f:[Object]}}}}}');
    a = [[[[[[]]]]]];
    text = stringify(a);
    assert.equal(text, '[[[[[[Array]]]]]]');
    log.setJsonSpace('  ');
  });

};
