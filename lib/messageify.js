module.exports = function messageify(arguments, jsonSpace) {
  var array = [];
  for (var index = 0, length = arguments.length; index < length; index++) {
    var line = arguments[index];
    if (typeof line != 'string') {
      line = JSON.stringify(line, null, jsonSpace);
    }
  }
  return lines.join('\n  ');
};
