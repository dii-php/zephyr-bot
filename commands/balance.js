const { SlashCommandBuilder } = require("discord.js");
const { getUsers, ensureUser } = require("../utils/economy");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("balance")
        .setDescription("Cek saldo"),

    async execute(interaction) {
        const users = getUsers();
        ensureUser(interaction.user.id);

        const money = users[interaction.user.id].money;

        await interaction.reply(`💰 Saldo kamu: $${money}`);
    }
};