const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer();

const io = new Server(server, {
    cors: {
        origin: '*'
    }
});

const players = {};

io.on('connection', (socket) => {

    console.log('Connected:', socket.id);

    socket.on('initialize', () => {

        players[socket.id] = {
            x: 0,
            y: 0,
            z: 0
        };

        socket.emit('playerData', {
            id: socket.id,
            players: players
        });

        socket.broadcast.emit('playerJoined', {
            id: socket.id
        });

        console.log('Initialized:', socket.id);
    });

    socket.on('positionUpdate', (data) => {

        players[socket.id] = {
            x: data.x,
            y: data.y,
            z: data.z
        };

        socket.broadcast.emit('playerMoved', {
            id: socket.id,
            position: players[socket.id]
        });
    });

    socket.on('disconnect', () => {

        console.log('Disconnected:', socket.id);

        delete players[socket.id];

        io.emit('playerLeft', {
            id: socket.id
        });
    });
});

server.listen(process.env.PORT || 3000, () => {
    console.log('Server running!');
});
