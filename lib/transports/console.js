var Base = require('./base')
var snippetStack = require('../../common/error/snippet-stack')
var colors = require('../../common/string/colors')
require('../../common/json/colorize')

var isWindows = (process.platform === 'win32')

/**
 * The `Console` log writes pretty strings to stdout.
 */
var Console = module.exports = function (config) {
  return Base(config, Console.defaults)
}

/**
 * Set up `Console` log defaults.
 */
Console.defaults = Base.decorate({

  // Indent messages and space JSON with 2 spaces.
  space: '  ',

  // Stringify with pretty colors.
  stringify: JSON.colorize,

  // Join arguments together as lines.
  join: function (args) {

    // Silence noisy getters.
    var errWrite = process.stderr.write
    var outWrite = process.stdout.write
    process.stderr.write = process.stdout.write = function () {}

    // Build an array of lines.
    var space = this.space
    var lines = []
    for (var i = 0, l = args.length; i < l; i++) {
      var line = args[i]
      if (typeof line !== 'string') {
        if (line instanceof Error) {
          line = (line.stack || line.toString())
        } else if (line && line.stack && /Error/.test(line.stack)) {
          var n = line.line
          var c = line.col || line.column
          var message = line.message + (n ? ' ' + n + (c ? ':' + c : '') : '')
          line = line.stack.replace(/^[\n]+/, message)
        } else {
          try {
            line = this.stringify(line, null, space, 0, 78, 3)
          } catch (e) {
            line = e.stack
          }
        }
      }
      lines.push(line)
    }

    // Restore stderr and stdout.
    process.stderr.write = errWrite
    process.stdout.write = outWrite

    // Return lines with breaks.
    return lines.join('\n')
  },

  // Log with colorful symbols instead of log level names.
  prefixes: {
    trace: (isWindows ? '+ ' : '\u271A ').cyan,
    debug: (isWindows ? '÷ ' : '\u2756 ').magenta,
    log: (isWindows ? '\u2192 ' : '\u279C ').gray,
    info: (isWindows ? '\u221A ' : '\u2714 ').green,
    warn: colors.yellow + (isWindows ? '* ' : '\u272D '),
    error: colors.red + (isWindows ? '\u00D7 ' : '\u2716 '),
    fatal: colors.red + (isWindows ? '* ' : '\u2739 ')
  },

  // Include colors in stack traces.
  colors: {
    trace: 'cyan',
    debug: 'magenta',
    log: 'gray',
    info: 'green',
    warn: 'yellow',
    error: 'red',
    fatal: 'red'
  },

  // Maximum number of lines to show before a stack trace line.
  snippetLeadLines: 5,

  // Where to start bracketed text.
  bracketStart: 80,

  // Format a string with colors and optionally stack traces.
  format: function (string, type) {
    var self = this
    string = string.replace(/^\[(\w+)\] ([^\n]+)/, function (match, name, text) {
      var length = text.plain.length
      var pad = Array(Math.max(self.bracketStart - length, 2)).join(' ')
      return text + pad + name.gray
    })
    string = string.replace(/\n +at[\s\S]+/, function (stack) {
      return snippetStack(stack, {
        color: self.colors[type],
        lead: self.snippetLeadLines,
        indent: '  '
      })
    })
    string = string.replace(/\n/g, '\n' + self.space)
    return self.prefixes[type] + string + '\n'
  }

}, Base.defaults)


/**
 * Get the length of a piece of text with colors removed.
 */
Console.getColorlessLength = function (text) {
  return text.replace(/\u001b\[\d\dm/g, '').length
}
