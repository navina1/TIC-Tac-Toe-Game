
const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: "http://127.0.0.1:5173/"
});
const allUsers = [];
const allRooms = [];
const renderFrom = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
  ]
io.on("connection", (socket) => {
    allUsers[socket.id] = { socket: socket, online: true };
    socket.on("disconnect", () => {
        console.log("A client disconnected");
    
        // Find the room the disconnected socket is in
        const roomIndex = Object.values(allRooms).findIndex(room => {
            const players = room.players;
            const player1 = players[0];
            const player2 = players[1];
            return player1.socket.id === socket.id || (player2 && player2.socket.id === socket.id);
        });
    
        if (roomIndex !== -1) {
            const room = Object.values(allRooms)[roomIndex];
            const players = room.players;
            const player1 = players[0];
            const player2 = players[1];
            const opponent = player1.socket.id === socket.id ? player2 : player1;
    
            // Emit 'opponent left' event to the remaining user
            opponent.socket.emit("opponentLeftMatch");
    
            // Remove the room from the list of active rooms
            delete allRooms[room.id];
        }
    
        // Remove the disconnected socket from the list of users
        delete allUsers[socket.id];
    });
    socket.on("exit",()=>{
        const roomIndex = Object.values(allRooms).findIndex(room => {
            const players = room.players;
            const player1 = players[0];
            const player2 = players[1];
            return player1.socket.id === socket.id || (player2 && player2.socket.id === socket.id);
        });
        if (roomIndex !== -1) {
            const room = Object.values(allRooms)[roomIndex];
            delete allRooms[room.id];
        }
        delete allUsers[socket.id];
    })

    socket.on("request_to_play", (data) => {
        const currentUser = allUsers[socket.id];
        currentUser.playerName = data.playerName;
        let room;
        for (const roomId in allRooms) {
            const players = allRooms[roomId].players;
            if (players.length === 1) {
                room = allRooms[roomId];
                break;
            }
        }

        if (!room) {
            room = createRoom();
        }
        room.players.push(currentUser);
        currentUser.roomId = room.id;
        // Notify the player about the opponent
        const opponentPlayer = room.players.find(player => player !== currentUser);

        if (opponentPlayer) {
            console.log("opponent found");
            console.log(opponentPlayer.playerName, currentUser.playerName);

            currentUser.socket.emit("opponentFound", {
                opponentName: opponentPlayer.playerName,
                playingAs: "circle",
                renderFrom:renderFrom
            });
            opponentPlayer.socket.emit("opponentFound", {
                opponentName: currentUser.playerName,
                playingAs: "cross",
                renderFrom:renderFrom
            });

            // Handle player moves between players
            currentUser.socket.on("playerMove", (data) => {
                opponentPlayer.socket.emit("enemyMoved", { ...data });
            });
            opponentPlayer.socket.on("playerMove", (data) => {
                currentUser.socket.emit("enemyMoved", { ...data });
            });

        } else {
            currentUser.socket.emit("opponentNotFound")
        }
    })
});
function createRoom() {
    const roomId = generateRoomId();
    const room = {
        id: roomId,
        players: []
    };
    allRooms[roomId] = room;
    return room;
}
function generateRoomId() {
    return Math.random().toString(36).substring(2, 7);
}

httpServer.listen(3000);