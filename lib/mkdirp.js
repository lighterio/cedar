// Adapted from mkdirp @ 0.5.0:
//  * Removed .mkdirP and .mkdirp methods.
//  * Removed fs option - using real filesystem only.
//  * Removed .sync method.

var path = require('path');
var fs = require('fs');
var no = function () {};

module.exports = mkdirP;

function mkdirP (p, opts, f, made) {
  if (typeof opts === 'function') {
    f = opts;
    opts = {};
  }
  else if (!opts || typeof opts !== 'object') {
    opts = { mode: opts };
  }

  var mode = opts.mode;

  if (mode === undefined) {
    mode = 0777 & (~process.umask());
  }
  if (!made) made = null;

  var cb = f || no;
  p = path.resolve(p);

  fs.mkdir(p, mode, function (er) {
    if (!er) {
      made = made || p;
      return cb(null, made);
    }
    switch (er.code) {
      case 'ENOENT':
        mkdirP(path.dirname(p), opts, function (er, made) {
          if (er) cb(er, made);
          else mkdirP(p, opts, cb, made);
        });
        break;

      // In the case of any other error, just see if there's a dir
      // there already.  If so, then hooray!  If not, then something
      // is borked.
      default:
        fs.stat(p, function (er2, stat) {
          // if the stat fails, then that's super weird.
          // let the original error be the failure reason.
          if (er2 || !stat.isDirectory()) cb(er, made);
          else cb(null, made);
        });
        break;
    }
  });
}
