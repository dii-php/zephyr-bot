const { SlashCommandBuilder } = require("discord.js");
const User = require("../models/User");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("Top richest player"),

    async execute(interaction) {

        const top = await User.find().sort({ money: -1 }).limit(10);

        let text = "🏆 Leaderboard:\n\n";

        for (let i = 0; i < top.length; i++) {
            text += `${i + 1}. <@${top[i].userId}> - $${top[i].money}\n`;
        }

        interaction.reply(text);
    }
};