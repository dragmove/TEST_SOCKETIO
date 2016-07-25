(function($) {
  "use strict";

  var Chat = function(socket) {
  	this.socket = socket;
  };

  Chat.prototype.sendMessage = function(room, text) {
  	var message = {
  		room: room,
  		text: text
  	};

    // send message to server side
  	this.socket.emit('message', message);
  };

  Chat.prototype.changeRoom = function(room) {
  	this.socket.emit('join', {
  		newRoom: room
  	});
  };

  Chat.prototype.processCommand = function(command) {
  	var words = command.split(' ');

  	var command = words[0].substring(1, words[0].length).toLowerCase();

  	var message = false;
  	switch(command) {
  		case 'join' : // change/create room
  			words.shift();

  			var room = words.join(' ');
  			this.changeRoom(room);
  		break;

  		case 'nick' : // change nickname
  			words.shift();

  			var name = words.join(' ');
  			this.socket.emit('nameAttempt', name);
  		break;

  		default :
  			message = 'Unrecognized command';
  	}

  	return message;
  };

  /*
   * implementation
   */
  var socket = io(),
  	chatApp = null;

  $(document).ready(init);

  function init() {
    chatApp = new Chat(socket);

    socket.on('nameResult', function(result) {
      console.log('client nameResult :', result);

    	var message;
    	if(result.success) {
    		message = 'You are now known as ' + result.name + '.';
    	}else{
    		message = result.message;
    	}

    	$('.messages').append(divSystemContentElement(message));
    });

    socket.on('joinResult', function(result) {
    	$('.room').text(result.room);
    	$('.messages').append(divSystemContentElement('Room changed.'));
    });

    socket.on('message', function(message) {
      console.log('message :', message);

      var newElement = $('<div></div>').text(message.text);
      $('.messages').append(newElement);
    });

    $('#send-message').focus();

    $('#send-form').submit(function() {
      processUserInput(chatApp, socket);
      return false;
    });

    return;

    

    socket.on('rooms', function(rooms) {
    	$('.room-list').empty();

    	for(var room in rooms) {
    		room = room.substring(1, room.length);
    		if(room != '') {
    			$('.room-list').append(divEscapedContentElement(room));
    		}
    	}

    	$('.room-list div').click(function() {
    		chatApp.processCommand('/join ' + $(this).text());
    		$('#send-message').focus();
    	});
    });

    window.setInterval(function() {
    	socket.emit('rooms');
    }, 5000);

    

    
  }
}(jQuery));
