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

Create a console logger, and use it.
```javascript
var log = require('chip')('console');

log('Use a string.');

log(['Or'], ['an'], ['array']);

log({or: 'json, obviously'});

log.debug('This will be preceded by a grey arrow, as above.');
log.trace('This will be preceded by a magenta diamond thingy.');
log.log('This will be preceded by a cyan plus.');
log.info('This will be preceded by a green check mark.');
log.warn('This will be preceded by a thick yellow asterisk.');
log.error('This will be preceded by a thick red X.');
```


## Roadmap

Chip will soon support more transports than just "console". Hey, it's a start.