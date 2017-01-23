window.onload = function() {
    var truco = new Truco();
    truco.init();
};
var Truco = function() {
    this.socket = null;
};

var myName;
var myTeam;
var eventsSet = false;


var cardTypes = ['1','2','3','4','5','6','7','Q','J','K'];
var suite = ['C','H','S','D'];

Truco.prototype = {
    init: function() {
        var that = this;
        this.socket = io.connect();
        this.socket.on('connect', function() {
            document.getElementById('info').textContent = 'get yourself a nickname :)';
            document.getElementById('nickWrapper').style.display = 'block';
            document.getElementById('nicknameInput').focus();
        });
        this.socket.on('nickExisted', function() {
            document.getElementById('info').textContent = '!nickname is taken, choose another pls';
        });
        this.socket.on('match-started', function(cards) {
            cards = JSON.parse(cards);

            document.getElementById('vira').innerHTML = that.getCard(cards.vira.card, cards.vira.suite);
            var hand = document.querySelector('.me .hand');
            hand.innerHTML = '';
            for (var i = 0 ; i < cards.hand.length; i++) {
                hand.innerHTML += that.getCard(cards.hand[i].card, cards.hand[i].suite);
            }
        });
        this.socket.on('player-joined-room', function(response) {
            response = JSON.parse(response);
            users = response.users;
            users.sort(function(a, b){return a.order-b.order});

            myName = myName || document.getElementById('nicknameInput').value;
            document.getElementById('loginWrapper').style.display = 'none';

            var players = document.getElementById('players');
            players.innerHTML = '';
            for (var i =0 ; i < users.length;i++) {
                players.innerHTML += that.getPlayer(users[i].username, users[i].team, i);
            }
            document.getElementById(myName).classList.add('me');
            if (!eventsSet) {
                window.addEventListener('mousemove', function(e) {
                    var playerContainer = document.getElementById(myName);
                    var p1 = playerContainer.getElementsByClassName('player-icon')[0];
                    var p1MiddleY = playerContainer.offsetTop - p1.offsetHeight - 20;// + p1.offsetTop + (p1.offsetHeight / 2);
                    var p1MiddleX = playerContainer.offsetLeft;// + p1.offsetLeft + (playerContainer.offsetWidth /2 );

                    var newX = e.pageX - p1MiddleX;
                    var newY = p1MiddleY - e.pageY;

                    var angle = Math.atan2(newX, newY) * 180 / Math.PI;
                    if (angle < 0){
                        angle = angle + 360;
                    }
                    document.getElementById(myName).getElementsByClassName('player-icon')[0].style.transform = 'rotate(' + angle + 'deg)';

                    that.socket.emit('move', JSON.stringify({angle: angle}));
                }, false);
                that.socket.on('move', function(user, msg, color) {
                    msg = JSON.parse(msg);
                    console.info(user);
                    console.info(msg);
                    document.getElementById(user).getElementsByClassName('player-icon')[0].style.transform = 'rotate(' + msg.angle + 'deg)';
                });
                eventsSet = true;
            }
        });
        this.socket.on('error', function(err) {
            if (document.getElementById('loginWrapper').style.display == 'none') {
                document.getElementById('status').textContent = '!fail to connect :(';
            } else {
                document.getElementById('info').textContent = '!fail to connect :(';
            }
        });
        
        document.getElementById('loginBtn').addEventListener('click', function() {
            var nickName = document.getElementById('nicknameInput').value;
            var match = document.getElementById('matchInput').value;
            if (nickName.trim().length != 0 && match.trim().length != 0) {
                that.socket.emit('login', nickName, match);
            }
        }, false);
        document.getElementById('start').addEventListener('click', function() {
            that.socket.emit('start');
        }, false);
    },
    getCard : function(cardType, suite) {
        return '<div class="card-img"><img src="/imgs/cards.png" style="left: -' + (cardType * 73) + 'px; top: -' + (suite * 98) + 'px;"></div>';
    },
    getPlayer : function(id, team, i) {
        var config = {
            '1': [{
                position : 'top: calc(50% - 300px)',
                color:'red'
            }, {
                position : 'top: calc(50% + 300px)',
                color:'blue'
            }],
            '2': [{
                position : 'left: calc(50% - 300px)',
                color:'green'
            }, {
                position : 'left: calc(50% + 300px)',
                color:'yellow'
            }]
        }[team][Math.floor(i / 2)];
        console.info(id, team, i);
        return '<div id="'+id+'" class="player" style="'+config.position+';">'+
                    '<div class="player-icon" style="border-bottom: 50px solid '+config.color+';"></div>'+
                    '<div class="player-name">'+id+'</div>'+
                    '<div class="player-cards">'+
                        '<img src="/imgs/card-back.jpg">'+
                        '<img src="/imgs/card-back.jpg">'+
                        '<img src="/imgs/card-back.jpg">'+
                        '<div class="hand">'+
                        '</div>'+
                    '</div>'+
                '</div>';
    }
};
