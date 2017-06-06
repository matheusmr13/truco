module.exports = function (options) {
	this.socker = options.socket
	this.user = options.user

	socket.on('login', function(username, matchCode) {
	})

	socket.on('disconnect', function() {
	})

	socket.on('start', function() {
	})

	socket.on('move', function(msg) {
	})

	socket.on('signal-sending', function(msg) {
	})

	socket.on('signal-ending', function(msg) {
	})
}