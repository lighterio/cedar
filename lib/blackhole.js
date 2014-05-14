module.exports = function() {
	var blackhole = function() {};
	blackhole.trace = blackhole;
	blackhole.debug = blackhole;
	blackhole.log = blackhole;
	blackhole.info = blackhole;
	blackhole.warn = blackhole;
	blackhole.error = blackhole;
	return blackhole;
};