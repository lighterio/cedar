/**
 * A `QueueStream` queues `write` arguments temporarily.
 */
var QueueStream = module.exports = function QueueStream () {
  this.queue = []
}

var doNothing = function () {}

QueueStream.prototype = {

  /**
   * Add the argument to the queue.
   */
  write: function () {
    this.queue.push(arguments)
  },

  /**
   * On end, do nothing.
   */
  end: doNothing,

  /**
   * Pipe the queue to another stream.
   */
  pipe: function (stream) {
    if (stream !== this) {
      var queue = this.queue
      for (var i = 0, l = queue.length; i < l; i++) {
        stream.write.apply(stream, queue[i])
      }
      queue.length = 0
    }
  },

  /**
   * To close the stream, do nothing.
   */
  close: doNothing,

}
