# Cedar

[![NPM Version](https://badge.fury.io/js/cedar.png)](http://badge.fury.io/js/cedar)
[![Build Status](https://travis-ci.org/lighterio/cedar.png?branch=master)](https://travis-ci.org/lighterio/cedar)
[![Code Coverage](https://coveralls.io/repos/lighterio/cedar/badge.png?branch=master)](https://coveralls.io/r/lighterio/cedar)
[![Dependencies](https://david-dm.org/lighterio/cedar.png?theme=shields.io)](https://david-dm.org/lighterio/cedar)
[![Support](http://img.shields.io/gittip/zerious.png)](https://www.gittip.com/lighterio/)

Cedar is a Node.js logging library that is designed to be fast, simple and
pretty. Its console transport shows color symbols before your log messages.


## Getting started

Add `cedar` to your dependencies.
```bash
npm install --save cedar
```

Create a stdout logger, and use it.
```javascript
var log = require('cedar')();

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

## Logger customization

#### log.setFormat(function callback[, string type])

Customize the message format.
```javascript
var log = require('cedar')();
log.setFormat(function (message, prefix, type) {
  return prefix + message + '!';
});
```

If you specify the optional `type` parameter, it will only change the formatter
for that type.

#### log.setLevel(string level)

Change the level of log that is shown (default: `log`).
```javascript
var log = require('cedar')();
log.setLogLevel('trace');
```

Setting to a level from this list will enable logs of that level and all
of the levels after it: `debug`, `trace`, `log`, `info`, `warn`, `error`.
Setting the level to `nothing` will stop all logs.

#### log.setPrefixes(object prefixes)

Customize prefixes for the console log messages.
```javascript
require('colors');

var log = require('cedar')();
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
var log = require('cedar')();
log.setJsonSpace('  ');
```
The default is two spaces.


## Transports

Cedar currently supports "console" and "file" transports.

### Console

The console logger writes to `process.stdout` with pretty colors.

Console is the default transport, so the following are equivalent:
```javascript
logger = require('cedar')();
logger = require('cedar')('console');
```

### Base

The base logger writes to a stream.
```javascript
var fs = require('fs');
var ws = fs.createWriteStream('my.log');
var logger = require('cedar')('base', {stream: ws});
logger.log('Write this string to a file');
```

### File

The file logger writes JSON arrays to a file.
The default file path is `logs/cedar.log`.
```javascript
var logger = require('cedar')('file', {path: 'logs/cedar.log'});
logger.log('Write this string to a file');
```
