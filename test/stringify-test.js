module.exports = function (log) {

  var stringify = function (data) {
    var string = log.stringify(data, undefined, log.space);
    return string.replace(/\u001b\[\d+m/g, '');
  };

  it('should handle nulls', function () {
    var text = stringify(null);
    is(text, 'null');
  });

  it('should handle booleans', function () {
    var text = stringify(true);
    is(text, 'true');
  });

  it('should handle numbers', function () {
    var text = stringify(1);
    is(text, '1');
  });

  it('should handle strings', function () {
    var text = 'hi';
    is(text, "hi");
  });

  if (log.transport == 'console') {

    it('should handle properties', function () {
      var text = stringify({n: null});
      is(text, '{n: null}');
    });

    it('should handle undefined', function () {
      var o = {};
      var text = stringify(o.a);
      is(text, "undefined");
    });

    it('should handle undefined properties', function () {
      var o = {};
      o.a = o.b;
      var text = stringify(o);
      is(text, "{a: undefined}");
    });

    it('should handle functions', function () {
      var text = stringify(function(){hi();});
      is(text, "function (){hi();}");
    });

    it('should handle function properties', function () {
      var text = stringify({f:function(){hi();}});
      is(text, "{f: function (){hi();}}");
    });

    it('should handle function properties with names', function () {
      var text = stringify({f:function hello(){hi();}});
      is(text, "{f: function hello(){hi();}}");
    });

    it('should handle dates', function () {
      var text = stringify(new Date(1402897046851));
      is(text, "Mon, 16 Jun 2014 05:37:26 GMT");
    });

    it('should handle date properties', function () {
      var text = stringify({start: new Date(1402897046851)});
      is(text, "{start: [Date: Mon, 16 Jun 2014 05:37:26 GMT]}");
    });

    it('should show error stack traces', function (done) {
      try {
        throw new Error('Hello');
      }
      catch (e) {
        var text = stringify(e);
        is.in(text, 'stringify-test.js');
        done();
      }
    });

    it('should succeed with stackless errors', function (done) {
      try {
        throw new Error('Hello');
      }
      catch (e) {
        e.stack = null;
        var text = stringify(e);
        is.notIn(text, 'stringify-test.js');
        done();
      }
    });

    it('should handle nested errors', function (done) {
      try {
        throw new Error('Hello');
      }
      catch (e) {
        var text = stringify({error: e});
        is.in(text, 'stringify-test.js');
        done();
      }
    });

    it('should handle objects', function () {
      Object.prototype.testHasOwnProperty = function () {};
      var text = stringify({ok: true, _underscored: 'private-ish'});
      is(text, '{ok: true, _underscored: "private-ish"}');
    });

    it('should handle circular objects', function () {
      var a = {};
      a.b = {};
      a.b.a = a;
      var text = stringify(a);
      is(text, "{b: {a: [Circular ^2]}}");
    });

    it('should handle arrays', function () {
      var a = [1, 2, 3];
      var text = stringify(a, 0, log.space);
      is(text, "[1, 2, 3]");
    });

    it('should handle empty arrays', function () {
      var a = [];
      var text = stringify(a);
      is(text, "[]");
    });

    it('should handle large objects', function () {
      var text = 'This string will cause stringify to include line breaks because it is longer than the maximum length for one line.';
      var string = stringify({a: text, b: text});
      is(string, '{\n  a: "' + text + '",\n  b: "' + text + '"\n}');
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
      var string = log.join([data]);
      is(string.indexOf('true') > 0, true);
    });

    it('should handle to a maximum depth', function () {
      log.space = null;
      var a = {b: {c: {d: {e: {f: {}}}}}};
      var text = stringify(a);
      is(text, '{b:{c:{d:{e:{f:[Object]}}}}}');
      a = [[[[[[]]]]]];
      text = stringify(a);
      is(text, '[[[[[[Array]]]]]]');
      log.space = '  ';
    });

  }

};
