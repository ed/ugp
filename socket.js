'use strict';
const server = require('./server');

var io = require('socket.io')(server);

let mainRoom = 'draw stuff';
let clients = [];
const words = ['white ferrari', 'whale', 'guitar', 'television', 'kanye west', 'yeezus', 'blonde', 'harambe', 'bread', 'dwight schrute', 'water bottle', 'smoothie', 'sofa', 'smoke', 'menage on my birthday', 'sailing stock', 'kpop', 'bubble pop', 'bubble gum', 'naps'];
const emptyGame = {
  afoot: false,
  players: [],
  word : '',
  artist: 'doesntmatter'
};

class DMTManager {
  constructor() {
    this.activeGames = {};
  }

  newGame(room, users) {
    if ( !(room in this.activeGames) ) {
      let dmtGame = new DMT(users, room, () => this.endGame(room));
      this.activeGames[room] = dmtGame;
      dmtGame.start();
    }
    else {
      console.log(`game already started in room ${room}`)
    }
  }

  endGame(room) {
    console.log(`end game in room ${room}`)
    if (room in this.activeGames){
      io.sockets.in(room).emit('update game', emptyGame);
      clearTimeout(this.activeGames[room].turnTimer);
      delete this.activeGames[room];
    }
  } 

  testWinner(room, msg) {
    if (room in this.activeGames){
      let game = this.activeGames[room];
      if (msg.author != game.currentArtist() && msg.text.trim().toLowerCase() == game.curWord) {
        console.log(`${msg.author} wins!`);
        game.endTurn(msg.author);
      }
    }
  }
}

class DMT {
  constructor(players, room, endGame) {
    this.room = room;
    this.players = players;
    this.endGame = endGame;
    this.curArtist = 'NONE';
    this.curWord = 'NONE';
  }

  start() {
    this.firstArtist = Math.floor(Math.random()*this.players.length);
    this.startTurn(this.firstArtist);
  }

  endTurn(winner) {
    clearTimeout(this.turnTimer);
    io.sockets.in(this.room).emit('winner', winner);
    let numArtists = this.players.length;
    let artist = (this.curArtist + 1)%numArtists;
    if (artist === this.firstArtist) {
      this.endGame();
    }
    else {
      this.startTurn(artist);
    }  
  }

  startTurn(artistInd) {
    this.curArtist = artistInd;
    this.curWord = words[Math.floor(Math.random()*words.length)+0];
    let game = {
      afoot: true,
      players: this.players,
      word: this.curWord,
      artist: this.currentArtist()
    };
    io.sockets.in(this.room).emit('update game', game);
    this.turnTimer = setTimeout(() => this.endTurn(), 65000);
  }

  timeLeft() {
    return Math.ceil((this.turnTimer._idleStart + this.turnTimer._idleTimeout - Date.now()) / 1000);
  }

  currentArtist() {
    return this.players[this.curArtist];
  }
}

let dmtManager = new DMTManager();

let usersByRoom = (room) => {
  let sockets = io.sockets.adapter.rooms[room].sockets;
  return Object.keys(sockets).map((socketId) => {
    var clientSocket = io.sockets.connected[socketId];
    return clientSocket.user;
  });
}

io.on('connection', (socket) => { 

  socket.on('subscribe', (id) => {
    console.log('created room: ', id);
    socket.join(id);
    socket.curRoom = id;
  });

  socket.on('chat msg', (msg) => {
    console.log(`${socket.user} sent ${msg.text} to thread: ${socket.curRoom}`);
    dmtManager.testWinner(socket.curRoom,msg);
    io.sockets.in(socket.curRoom).emit('update', msg);
  });

  socket.on('new stroke', (stroke) => {
    socket.broadcast.emit('update canvas', stroke.canvas);
  });

  socket.on('undo stroke', (position) => {
    socket.broadcast.emit('undo');
  });

  socket.on('clear all', (position) => {
    socket.broadcast.emit('clear');
  });

  socket.on('redo stroke', () => {
    socket.broadcast.emit('redo');
  });

  socket.on('start game', () => {
    console.log(socket.curRoom);
    let players = usersByRoom(socket.curRoom);
    dmtManager.newGame(socket.curRoom,players);
  });

  socket.on('add user', (username) => {
    socket.user = username;
    socket.rooms = [mainRoom];
    socket.curRoom = mainRoom;
    socket.join(mainRoom);
    socket.broadcast.to(socket.id).emit('room change', socket.rooms);
    clients.push({
      id: socket.room, 
      user:username,
    });
  });
});

module.exports = io;