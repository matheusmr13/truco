var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    users = [];
app.use('/', express.static(__dirname + '/www'));
server.listen(process.env.PORT || 3000);

var index = 0;
var matches = {};

io.sockets.on('connection', function(socket) {
    socket.on('login', function(username, matchCode) {
        if (!username || !matchCode) {
            socket.emit('error');
        }
        if (matches[matchCode]) {
            let match = matches[matchCode];
            if (match.loggedUsers == 4) {
                socket.emit('error');
                console.log('Match ' + matchCode + ' is full!');
            } else {
                if (match.users[username]) {
                    socket.emit('error');
                    console.log('Match ' + matchCode + ' already have an user with username ' + username);
                } else {
                    socket.username = username;
                    socket.matchCode = matchCode;
                    match.loggedUsers++;
                    var teamNumber = (match.loggedUsers % 2) + 1;
                    var usersToEmit = [];
                    match.users[username] = {
                        socket: socket,
                        loggedDate: new Date(),
                        team: teamNumber,
                        order: match.loggedUsers
                    };
                    for (let user in match.users) {
                        usersToEmit.push({
                            username: user,
                            team: match.users[user].team,
                            order: match.users[user].order
                        })
                    }
                    for (let user in match.users) {
                        match.users[user].socket.emit('player-joined-room', JSON.stringify({
                            users: usersToEmit
                        }));
                    }
                }
            }
        } else {
            socket.username = username;
            socket.matchCode = matchCode;
            matches[matchCode] = {};
            matches[matchCode].users = {};
            matches[matchCode].loggedUsers = 1;
            matches[matchCode].users[username] = {
                socket: socket,
                loggedDate: new Date(),
                team: 2,
                order: 0
            };
            socket.emit('player-joined-room', JSON.stringify({
                users: [{
                    username: username,
                    team: 2,
                    order: 0
                }]
            }));
        }
    });
    socket.on('disconnect', function() {
        var match = matches[socket.matchCode];
        delete match.users[socket.username];
        for (let user in match.users) {
            match.users[user].socket.emit('player-exit-room', socket.username)
        }
    });
    socket.on('move', function(msg) {
        var match = matches[socket.matchCode];
        for (let user in match.users) {
            if (user != socket.username) {
                match.users[user].socket.emit('move', socket.username, msg);
            }
        }
    });
});
