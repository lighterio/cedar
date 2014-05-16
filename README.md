# Chip

[![NPM Version](https://badge.fury.io/js/chip.png)](http://badge.fury.io/js/chip)
[![Build Status](https://travis-ci.org/zerious/chip.png?branch=master)](https://travis-ci.org/zerious/chip)
[![Code Coverage](https://coveralls.io/repos/zerious/chip/badge.png?branch=master)](https://coveralls.io/r/zerious/chip)
[![Dependencies](https://david-dm.org/zerious/chip.png?theme=shields.io)](https://david-dm.org/zerious/chip)
[![Support](http://img.shields.io/gittip/zerious.png)](https://www.gittip.com/zerious/)

Chip is a Node.js logging library that is designed to be fast, simple and
pretty. Its console transport shows little color symbols before your log messages.


## Getting started

Add `chip` to your dependencies.
```bash
npm install --save chip
```

Create a stdout logger, and use it.
```javascript
var log = require('chip')();

log('Use a string.');

log(['Or'], ['an'], ['array']);

log({or: 'json, obviously'});

log.debug('This will be preceded by a magenta diamond thingy.');
log.trace('This will be preceded by a cyan plus.');
log.log('This will be preceded by a grey arrow, as above.');
log.info('This will be preceded by a green check mark.');
log.warn('This will be preceded by a thick yellow asterisk.');
log.error('This will be preceded by a thick red X.');
```

## Default logger customization

#### log.setFormat(function callback[, string type])

Customize the message format.
```javascript
var log = require('chip')();
log.setFormat(function (message, prefix, type) {
  return prefix + message + '!';
});
```

If you specify the optional `type` parameter, it will only change the formatter
for that type.

#### log.setLevel(string level)

Change the level of log that is shown (default: `log`).
```javascript
var log = require('chip')();
log.setLogLevel('trace');
```

Setting to a level from this list will enable logs of that level and all
of the levels after it: `debug`, `trace`, `log`, `info`, `warn`, `error`.
Setting the level to `nothing` will stop all logs.

#### log.setPrefixes(object prefixes)

Customize prefixes for the console log messages.
```javascript
require('colors');

var log = require('chip')();
log.setPrefixes({
  debug: 'DEBUG '.magenta,
  trace: 'TRACE '.cyan,
  log: 'LOG   '.grey,
  info: 'INFO  '.green,
  warn: 'WARN  '.yellow,
  error: 'ERROR '.red
});

// You can also get the prefixes:
var prefixes = log.getPrefixes();
```

#### log.setJsonSpace(string whitespace)

Customize the spacing that JSON.stringify uses.
```javascript
var log = require('chip')();
log.setJsonSpace('  ');
```
The default is two spaces.


## Roadmap

Chip will soon support more transports than `stdout`. Hey, it's a start.
