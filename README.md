# <a href="http://lighter.io/cedar" style="font-size:40px;text-decoration:none;color:#000"><img src="https://cdn.rawgit.com/lighterio/lighter.io/master/public/cedar.svg" style="width:90px;height:90px"> Cedar</a>
[![NPM Version](https://img.shields.io/npm/v/cedar.svg)](https://npmjs.org/package/cedar)
[![Downloads](https://img.shields.io/npm/dm/cedar.svg)](https://npmjs.org/package/cedar)
[![Build Status](https://img.shields.io/travis/lighterio/cedar.svg)](https://travis-ci.org/lighterio/cedar)
[![Code Coverage](https://img.shields.io/coveralls/lighterio/cedar/master.svg)](https://coveralls.io/r/lighterio/cedar)
[![Dependencies](https://img.shields.io/david/lighterio/cedar.svg)](https://david-dm.org/lighterio/cedar)
[![Support](https://img.shields.io/gratipay/Lighter.io.svg)](https://gratipay.com/Lighter.io/)


## TL;DR

Cedar is a Node.js logger, designed to be fast, extensible, and super useful.

### Powerful features

* Modifiable logging prefixes, formatters, and stringify functions.
* Loggers which are functions
* A `console` transport with color unicode symbols and helpful code snippets
  inside stack traces.
* A `file` transport that can roll by day, hour or minute.
* A `multi` transport, which supports `cluster` by sending worker logs to the
  master process.


### Getting started

Add `cedar` to your dependencies.
```bash
npm install --save cedar
```

Create a logger, and use it.
```javascript
var log = require('cedar')([
  {
    transport: 'console' // == default
    level: 'debug' // == default
  },
  {
    transport: 'file',
    level: 'info',
    path: 'log/${YYYY}/${MM}/${DD}/${HOST}.log'
  }
]);

log('Log a string');
log.debug(['or', 'an', 'array']);
log.trace({or: 'JSON of course'});
log.log('and', 'multiple', 'arguments', 'are', 'supported.', true);
log.info('This is the 1st message that would log to file, based on `level` log messages go to all transports.')

log.debug('This gets formatted as a debug message.');
log.trace('This gets formatted as a trace message.');
log.log('This gets formatted as a log message.');
log.info('This gets formatted as an info message.');
log.warn('This gets formatted as a warning message.', error);
log.error('This gets formatted as an error message.', error);
log.alarm('This gets formatted as an alarming message.', error);
```

## Logger customization

#### log.format = function callback[, string type]

Customize the message format.
```javascript
var log = require('cedar')();
log.format = function (message, prefix, type {
  return prefix + message + '!';
});
```

If you specify the optional `type` parameter, it will only change the formatter
for that type.

#### log.level `string`

Configures the minimum level of logging that is shown (default: `log`).
```javascript
var log = require('cedar')();
log.level = 'trace';
```

Setting to a level from this list will enable logs of that level and all
of the levels after it: `debug`, `trace`, `log`, `info`, `warn`, `error`.
Setting the level to `nothing` will stop all logs.

#### log.prefixes `object`

Customize prefixes for the color log messages.
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
var prefixes = log.prefixes;
```

#### log.indent

Configures the spacing that stringify uses.
```javascript
var log = require('cedar')();
log.space = '  ';
```
The default is two spaces.


## Transports

Cedar currently supports "console" and "file" loggers.

### Base

The base logger writes to a stream, and the other loggers extend it.
```javascript
var fs = require('fs');
var writeStream = fs.createWriteStream('my.log');
var logger = require('cedar')('base', {stream: writeStream});
logger.log('Write this string to a file');
```

### Console

The `console` logger writes to `process.stdout` with pretty colors.

Console is the default transport, so the following are equivalent:
```javascript
logger = require('cedar')();
logger = require('cedar')('color');
```

### File

The `file` logger writes JSON messages to a file.
The default file path is `logs/cedar.log`.
```javascript
var logger = require('cedar')('file', {path: 'logs/cedar.log'});
logger.log('Write this string to a file');
```

### Multi

The `multi` logger writes to multiple loggers at once.


## Acknowledgements

We would like to thank all of the amazing people who use, support,
promote, enhance, document, patch, and submit comments & issues.
Cedar couldn't exist without you.

We depend on [lru-cache](https://www.npmjs.org/package/lru-cache),
[leveldown](https://www.npmjs.org/package/leveldown) and
[xxhash](https://www.npmjs.org/package/xxhash), so thanks are due to
[Isaac Schlueter](https://github.com/isaacs),
[Rod Vagg](https://github.com/rvagg),
[C J Silverio](https://github.com/ceejbot), and all of their contributors.

Additionally, huge thanks go to [TUNE](http://www.tune.com) for employing
and supporting [Cedar](http://lighter.io/cedar) project maintainers,
and for being an epically awesome place to work (and play).


## MIT License

Copyright (c) 2014 Sam Eubank

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


## How to Contribute

We welcome contributions from the community and are happy to have them.
Please follow this guide when logging issues or making code changes.

### Logging Issues

All issues should be created using the
[new issue form](https://github.com/lighterio/cedar/issues/new).
Please describe the issue including steps to reproduce. Also, make sure
to indicate the version that has the issue.

### Changing Code

Code changes are welcome and encouraged! Please follow our process:

1. Fork the repository on GitHub.
2. Fix the issue ensuring that your code follows the
   [style guide](http://lighter.io/style-guide).
3. Add tests for your new code, ensuring that you have 100% code coverage.
   (If necessary, we can help you reach 100% prior to merging.)
   * Run `npm test` to run tests quickly, without testing coverage.
   * Run `npm run cover` to test coverage and generate a report.
   * Run `npm run report` to open the coverage report you generated.
4. [Pull requests](http://help.github.com/send-pull-requests/) should be made
   to the [master branch](https://github.com/lighterio/cedar/tree/master).

### Contributor Code of Conduct

As contributors and maintainers of Cedar, we pledge to respect all
people who contribute through reporting issues, posting feature requests,
updating documentation, submitting pull requests or patches, and other
activities.

If any participant in this project has issues or takes exception with a
contribution, they are obligated to provide constructive feedback and never
resort to personal attacks, trolling, public or private harassment, insults, or
other unprofessional conduct.

Project maintainers have the right and responsibility to remove, edit, or
reject comments, commits, code, edits, issues, and other contributions
that are not aligned with this Code of Conduct. Project maintainers who do
not follow the Code of Conduct may be removed from the project team.

Instances of abusive, harassing, or otherwise unacceptable behavior may be
reported by opening an issue or contacting one or more of the project
maintainers.

We promise to extend courtesy and respect to everyone involved in this project
regardless of gender, gender identity, sexual orientation, ability or
disability, ethnicity, religion, age, location, native language, or level of
experience.
