/**
 * A `QueueStream` queues `write` arguments temporarily.
 */
var QueueStream = module.exports = function QueueStream() {
  this.queue = [];
};

QueueStream.prototype = {

  /**
   * Add the argument to the queue.
   */
  write: function () {
    this.queue.push(arguments);
  },

  /**
   * The queue should be piped somewhere before closing.
   */
  end: function () {
    if (this.queue.length) {
      throw new Error('[Cedar] QueueStream `pipe(stream)` should be called before `end()`.');
    }
  },

  /**
   * Pipe the queue to another stream.
   */
  pipe: function (stream) {
    var queue = this.queue;
    for (var i = 0, l = queue.length; i < l; i++) {
      stream.write.apply(stream, queue[i]);
    }
    queue.length = 0;
  }

};