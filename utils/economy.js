const fs = require("fs");
const path = "./database/users.json";

function getUsers() {
    return JSON.parse(fs.readFileSync(path));
}

function saveUsers(data) {
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

function ensureUser(userId) {
    const users = getUsers();
    if (!users[userId]) {
        users[userId] = {
            money: 500,
            inventory: {},
            rodLevel: 1
        };
        saveUsers(users);
    }
    return users[userId];
}

function addMoney(userId, amount) {
    const users = getUsers();
    ensureUser(userId);
    users[userId].money += amount;
    saveUsers(users);
}

function removeMoney(userId, amount) {
    const users = getUsers();
    ensureUser(userId);
    users[userId].money -= amount;
    saveUsers(users);
}

function addItem(userId, item) {
    const users = getUsers();
    ensureUser(userId);
    if (!users[userId].inventory[item]) {
        users[userId].inventory[item] = 0;
    }
    users[userId].inventory[item]++;
    saveUsers(users);
}

module.exports = {
    ensureUser,
    addMoney,
    removeMoney,
    addItem,
    getUsers,
    saveUsers
};