const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const express = require("express");
const hbs = require('express-hbs');
const createMessage = require("./utils/messages");
const {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
    getNumUsers,
    getNumRooms
} = require("./utils/users");

const PORT = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(publicDirectoryPath));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, "..", "views"));
app.engine('hbs', hbs.express4());

app.get("/", (req, res) => {
    res.render("index", {
        numUsers:getNumUsers(),
        numRooms:getNumRooms(),
    });
});

io.on("connection", (socket) => {

    socket.on("join", (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options })
        if (error) return callback(error);

        socket.join(user.room);
        socket.emit("message", createMessage("[Server]", "Welcome."));

        socket.broadcast.to(user.room).emit("message", createMessage(
            "[Server]", `${user.username} has joined.`
        ));

        io.to(user.room).emit("roomData", {
            room: user.room,
            users: getUsersInRoom(user.room)
        });

        callback();
    });

    socket.on("sendMessage", (message, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit("message", createMessage(user.username, message));
        callback();
    });

    socket.on("disconnect", () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit("message", createMessage(
                "[Server]", `${user.username} has left.`
            ));

            io.to(user.room).emit("roomData", {
                room: user.room,
                users: getUsersInRoom(user.room)
            });
        }
    });

});

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
