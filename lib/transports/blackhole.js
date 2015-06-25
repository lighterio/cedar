var Base = require('./base')

/**
 * The `Blackhole` log drops everything.
 */
module.exports = function (config) {
  config.stream = {write: function () {}}
  return Base(config)
}
