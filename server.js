const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer();
const io = new Server(server, { cors: { origin: "*" } });

let players = {};

io.on('connection', (socket) => {
  socket.on('initialize', () => {
    players[socket.id] = { x: 0, y: 0, z: 0 };
    socket.emit('playerData', { id: socket.id, players });
    socket.broadcast.emit('playerJoined', { id: socket.id });
  });

  socket.on('positionUpdate', (data) => {
    players[socket.id] = data;
    socket.broadcast.emit('playerMoved', { id: socket.id, position: data });
  });

  socket.on('disconnect', () => {
    delete players[socket.id];
    io.emit('playerLeft', { id: socket.id });
  });
});

server.listen(process.env.PORT || 3000, () => console.log('Server running!'));
