# <a href="http://lighter.io/cedar" style="font-size:40px;text-decoration:none"><img src="https://cdn.rawgit.com/lighterio/lighter.io/master/public/cedar.svg" style="width:90px;height:90px"> Cedar</a>
[![Chat](https://badges.gitter.im/chat.svg)](//gitter.im/lighterio/public)
[![Version](https://img.shields.io/npm/v/cedar.svg)](//www.npmjs.com/package/cedar)
[![Downloads](https://img.shields.io/npm/dm/cedar.svg)](//www.npmjs.com/package/cedar)
[![Build](https://img.shields.io/travis/lighterio/cedar.svg)](//travis-ci.org/lighterio/cedar)
[![Coverage](https://img.shields.io/coveralls/lighterio/cedar/master.svg)](//coveralls.io/r/lighterio/cedar)
[![Style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](//www.npmjs.com/package/standard)


Cedar is a Node.js log, designed to be fast, extensible, and super useful.

### Powerful features

* Modifiable logging prefixes, formatters, and stringify functions.
* Logs which are functions, allowing shorthand calls.
* A `console` transport with color unicode symbols and helpful code snippets
  inside stack traces.
* A `file` transport that can rotate by day, hour or minute.
* A `multi` transport, which supports `cluster`, sending worker logs to the
  master process.


### Quick Start

Add `cedar` to your dependencies.
```bash
npm install --save cedar
```

Create a log, and use it.
```js
var log = require('cedar')([
  {
    transport: 'console' // Default.
    level: 'trace' // Default.
  },
  {
    transport: 'file',
    level: 'info',
    path: 'log/${YYYY}/${MM}/${DD}/app_${HOST}.log'
  }
]);

log('Log a string'); // Shorthand.
log.debug(['or', 'an', 'array']);
log.trace({or: 'JSON of course'});
log.log('and', 'multiple', 'arguments', 'are', 'supported.', true);
log.info('This message will also log to file, based on `level`.')

log.trace('This gets formatted as a trace message, with a stack trace');
log.debug('This gets formatted as a debug message.');
log.log('This gets formatted as a log message.');
log.info('This gets formatted as an info message.');
log.warn('This gets formatted as a warning message.', error);
log.error('This gets formatted as an error message.', error);
log.fatal('This gets formatted as a fatal error message.', error);
```

## Convention & Configuration
Each Cedar transport has properties with defaults that can be
overridden using a config object. They also have getters and
setters, allowing you to change them later.

For example:
```js
// Set the log `level` in a configuration object.
var log = require('cedar')({level: 'warn'}); // "warn", "error" and "fatal".

log('log');         // Ignore.
log.error('error'); // Log "error".

// Assign the `level`, thereby invoking its setter.
log.level = 'debug';

log('log');         // Log "log".
log.error('error'); // Log "error".
log.trace('trace'); // Ignore.
```

#### log.level `string`

Configures the minimum level of logging that is shown (default: `trace`).
```js
var log = require('cedar')();
log.level = 'debug';
```

Setting to a level from this list will enable logs of that level and all
of the levels after it: `debug`, `trace`, `log`, `info`, `warn`, `error`
and `fatal`. Setting the level to `nothing` will stop all logs.

#### log.prefixes `object`

Customize prefixes for the color log messages.
```js
require('colors');

var log = require('cedar')();
log.prefixes = {
  trace: 'TRACE: '.cyan,
  debug: 'DEBUG: '.magenta,
  log:   'LOG:   '.grey,
  info:  'INFO:  '.green,
  warn:  'WARN:  '.yellow,
  error: 'ERROR: '.red,
  fatal: 'FATAL: '.red
};
```

#### log.space `string`

Configures the spacing that stringify uses.
```js
var log = require('cedar')();
log.space = '  ';
```
The default is two spaces.


#### log.format `function`

Customize the message format, given 3 arguments.
```js
var log = require('cedar')();
log.format = function (message, prefix, type) {
  return prefix + message + ' from log.' + type + '!';
});
log.info('Hello'); // "INFO Hello from log.info!"
```

## Transports

Cedar currently supports 4 main transports: "base", "console", "file" and
"multi". Each transport takes an optional configuration object.

### Base

The base transport writes to a stream, and other transports extend it.
```js
var fs = require('fs');
var writeStream = fs.createWriteStream('my.log');
var base = require('cedar')('base', {stream: writeStream});
base.log('Write this string to `my.log`');
```

### Console

The `console` log writes to `process.stdout` with pretty colors.

Console is the default transport, so the following are equivalent:
```js
log = require('cedar')();
log = require('cedar')('color');
```

### File

The `file` log writes JSON messages to a file. In addition, it acts as a
simple event emitter so you can receive notifications when file rotation
events occur.
```js
var file = require('cedar')('file', {
  path: 'log/app_${YYYY}-${MM}-${DD}_${HH}:${NN}_${HOST}.log'
});
file.info('This will go into a file.');

var console = require('cedar')();

file.on('open', function (path) {
  console.log('Opened "' + path + '" for logging.');
});

file.on('close', function (path) {
  console.log('Closed "' + path + '".');
});
```


### Multi

The `multi` log writes to multiple logs at once. Its configuration object
is an array of configurations with transports specified by a `transport`
property.

```js
var log = require('cedar')([
  {transport: 'console'},
  {transport: 'file', level: 'info', path: 'log/app_${YYYY}-${MM}-${DD}_${HOST}.log'},
  {transport: 'file', level: 'error', path: 'log/${YYYY}/${MM}/${DD}/error_${HOST}.log'}
]);
```


## More on Cedar...
* [Contributing](//github.com/lighterio/cedar/blob/master/CONTRIBUTING.md)
* [License (ISC)](//github.com/lighterio/cedar/blob/master/LICENSE.md)
* [Change Log](//github.com/lighterio/cedar/blob/master/CHANGELOG.md)
* [Roadmap](//github.com/lighterio/cedar/blob/master/ROADMAP.md)
