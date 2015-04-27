var path = require('path');
var express = require("express");
var jade = require("jade");
var socketIO = require("socket.io");

var args = process.argv.slice(2);
var SERVER = args[0] || "localhost";
var PORT = args[1] || 3000;

// list of users
var globalList = {
    activeUsers: {}
};

// server initialization
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.engine('jade', jade.__express);
app.use(express.static(__dirname + '/public'));

app.get("/", function(req, res) {
    res.render("index", {
        serverAddr: SERVER,
        port: PORT
    });
});

var serverSocket = socketIO.listen(app.listen(PORT));

serverSocket.sockets.on('connection', function(socket) {

    // add socket ID
    globalList.activeUsers[socket.id] = 0;

    // welcome msg
    socket.emit('welcome', {
        message: 'Welcome to Chat Palace!'
    });

    // callback on getting msg from client
    socket.on('send', function(data) {
        serverSocket.sockets.emit('message', data);
    });

    // get the user info
    socket.on('userinfo', function(info) {
        globalList.activeUsers[socket.id] = info.username;
    });

    // on disconnection
	socket.on('disconnect', function() {
        delete globalList.activeUsers[socket.id];
    });

    setInterval(function() {
        socket.emit('activeUsers', {
            activeUsers: Object.keys(globalList.activeUsers).length
        });
    }, 1000);

});

console.log("Chat server running on " + SERVER + " on port " + PORT);
module.exports = app;
