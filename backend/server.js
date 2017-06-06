var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    users = [];
app.use('/', express.static(__dirname + '/www'));
server.listen(process.env.PORT || 3000);

var index = 0;
var matches = {};

var cardTypes = ['1','2','3','4','5','6','7','Q','J','K'];
var suite = ['C','H','S','D'];

var setupMatch = function(socket) {
    match = {};
    match.users = {};
    match.loggedUsers = 1;
    match.users[socket.username] = {
        socket: socket,
        loggedDate: new Date(),
        team: 2,
        order: 0,
        signal: []
    };

    matches[socket.matchCode] = match;
};

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

var setupDeck = function(match) {
    match.deck = [];
    for (var i = 0; i < cardTypes.length;i++) {
        for (var j = 0; j < suite.length;j++) {
            match.deck.push({
                card: i,
                suite: j
            });
        }
    }
    match.deck = shuffle(match.deck);
}

var prepareListOfUsers = function(users) {
    var usersToEmit = [];
    for (let user in users) {
        usersToEmit.push({
            username: user,
            team: users[user].team,
            order: users[user].order
        })
    }
    return usersToEmit;
};

io.sockets.on('connection', function(socket) {
    socket.on('login', function(username, matchCode) {
        if (!username || !matchCode) {
            socket.emit('error');
            return;
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
                        order: match.loggedUsers,
                        signal: []
                    };
                    
                    for (let user in match.users) {
                        match.users[user].socket.emit('player-joined-room', JSON.stringify({
                            users: prepareListOfUsers(match.users)
                        }));
                    }
                }
            }
        } else {
            socket.username = username;
            socket.matchCode = matchCode;
            setupMatch(socket);
            socket.emit('player-joined-room', JSON.stringify({
                users: prepareListOfUsers(match.users)
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
    socket.on('start', function() {
        var match = matches[socket.matchCode];
        if (match) {
            match.points = {};
            match.points['1'] = 0;
            match.points['2'] = 0;
            setupDeck(match);
            var vira = match.deck.shift();
            for (let user in match.users) {
                var cards = {
                    vira: vira,
                    hand: [match.deck.shift(),match.deck.shift(),match.deck.shift()]   
                };
                match.users[user].socket.emit('match-started', JSON.stringify(cards));
            }
        }
    });
    socket.on('move', function(msg) {
        var match = matches[socket.matchCode];
        if (match) {
            match.users[socket.username].angle = msg.angle;
            for (let user in match.users) {
                if (user != socket.username) {
                    match.users[user].socket.emit('move', socket.username, msg);
                }
            }
        }
    });
    socket.on('signal-sending', function(msg) {
        var match = matches[socket.matchCode];
        if (match) {
            match.users[socket.username].signal.push(msg);
            for (let user in match.users) {
                if (user != socket.username) {
                    //check if it is on range
                    match.users[user].socket.emit('signal-update', socket.username, JSON.stringify(match.users[socket.username].signal));
                }
            }
        }
    });
    socket.on('signal-ending', function(msg) {
        var match = matches[socket.matchCode];
        if (match) {
            var signals = match.users[socket.username].signal;
            signals.splice(signals.indexOf(msg),1);
            for (let user in match.users) {
                if (user != socket.username) {
                    //check if it is on range
                    match.users[user].socket.emit('signal-update', socket.username, JSON.stringify(signals));
                }
            }
        }
    });
});