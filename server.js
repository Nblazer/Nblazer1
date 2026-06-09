const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer();

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

const players = {};

io.on("connection", (socket) => {

    console.log("Player connected:", socket.id);

    // send existing players to new player
    socket.emit("currentPlayers", players);

    // add new player
    players[socket.id] = { x: 0, y: 0, z: 0 };

    // tell others
    socket.broadcast.emit("newPlayer", {
        id: socket.id,
        data: players[socket.id]
    });

    // movement
    socket.on("move", (data) => {
        if (!players[socket.id]) return;

        players[socket.id] = data;

        socket.broadcast.emit("playerMoved", {
            id: socket.id,
            data
        });
    });

    // disconnect
    socket.on("disconnect", () => {
        console.log("Player left:", socket.id);

        delete players[socket.id];

        io.emit("removePlayer", socket.id);
    });
});

server.listen(process.env.PORT || 3000, () => {
    console.log("Server running");
});
