const users = [];

const addUser = ({ id, username, room }) => {
    username = username.trim().toLowerCase().slice(0, 30);
    room = room.trim().toLowerCase().slice(0, 50);

    if (!username || !room) return { error: "Username & room are required." };


    const existingUser = users.find((user) => {
        return user.room === room && user.username === username;
    })

    if (existingUser) return { error: "Username is taken." };

    const user = { id, username, room };
    users.push(user);
    return { user };
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);

    if (index !== -1) return users.splice(index, 1)[0];
}

const getUser = (id) => users.find((user) => user.id === id)

const getUsersInRoom = (room) => users.filter((user) => user.room === room);

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
};
