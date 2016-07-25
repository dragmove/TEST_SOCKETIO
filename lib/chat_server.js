var socketio = require('socket.io');

var io,
	guestNumber = 1,
	nickNames = {},
	namesUsed = [],
	currentRoom = {};

exports.listen = function(server) {
	io = socketio(server);

	io.set('log level', 1);

	io.on('connection', function(socket) {

		// 1. localhost:3000 접속시, guest name 을 정하고 이를 client 로 던져 표기한다.
		guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);
		console.log('guestNumber :', guestNumber);

		joinRoom(socket, 'Lobby');

		handleMessageBroadcasting(socket, nickNames);

		/*
		handleNameChangeAttempts(socket, nickNames, namesUsed);
		handleRoomJoining(socket);

		socket.on('rooms', function() {
			socket.emit('rooms', io.sockets.manager.rooms);
		});
		*/

		handleClientDisconnection(socket, nickNames, namesUsed);
	});
};

function assignGuestName(socket, guestNumber, nickNames, namesUsed) {
	console.log('socket.id :', socket.id);

	var name = 'Guest' + guestNumber;
	nickNames[socket.id] = name;
	console.log('nickNames :', nickNames);

	socket.emit('nameResult', {
		success: true,
		name: name
	});

	namesUsed.push(name);

	// set nickNames[socket.id]
	// set name in namesUsed

	return guestNumber + 1;
}

function handleClientDisconnection(socket) {
	socket.on('disconnect', function() {
		var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
		namesUsed.splice(nameIndex, 1);

		delete nickNames[socket.id];

		console.log('disconnect - nickNames :', nickNames);
		console.log('disconnect - namesUsed :', namesUsed);
	});
}

function joinRoom(socket, room) {
	console.log('socket.id :', socket.id);

	socket.join(room);

	currentRoom[socket.id] = room;

	socket.emit('joinResult', {
		room: room
	});

	// room 내의, 자신을 제외한 모두에게 message 전달.
	socket.broadcast.to(room).emit('message', {
		text: nickNames[socket.id] + ' has joined ' + room + '.'
	});

	var usersInRoom = io.sockets.adapter.rooms[room];
	if (usersInRoom.length > 1) {
		var usersInRoomSummary = 'Users currently in ' + room + '.';


		/*
		for(var index in usersInRoom) {
			var userSocketId = userInRoom[index].id;
			if (userSocketId != socket.id) {
				if (index > 0) {
					usersInRoomSummary += ', ';
				}

				usersInRoomSummary += nickNames[userSocketId];
			}
		}

		usersInRoomSummary += '.';
		socket.emit('message', {
			text: usersInRoomSummary
		});
		*/
	}
}

function handleMessageBroadcasting(socket) {
	// client side 의 sendMessage() => 해당 room 에 message text 를 broadcast
	socket.on('message', function(message) {
		console.log('get message :', message);

		socket.broadcast.to(message.room).emit('message', {
			text: nickNames[socket.id] + ': ' + message.text
		});
	});
}






function handleNameChangeAttempts(socket, nickNames, namesUsed) {
	socket.on('nameAttempt', function(name) {
		console.log('nameAttempt - name :', name);

		if (name.indexOf('Guest') == 0) {
			socket.emit('nameResult', {
				success: false,
				message: 'Names cannot begin with "Guest".'
			});
		} else {
			if (namesUsed.indexOf(name) == -1) {
				var previousName = nickNames[socket.id];

				var previousNameIndex = namesUsed.indexOf(previousName);
				namesUsed.push(name);

				delete namesUsed[previousNameIndex];

				socket.emit('nameResult', {
					success: true,
					name: name
				});

				socket.broadcast.to(currentRoom[socket.id]).emit('message', {
					text: previousName + ' is now known as ' + name + '.'
				});
			} else {
				socket.emit('nameResult', {
					success: false,
					message: 'That name is already in use.'
				});
			}
		}
	});
}

function handleRoomJoining(socket) {
	socket.on('join', function(room) {
		socket.leave(currentRoom[socket.id]);
		joinRoom(socket, room.newRoom);
	});
}

















