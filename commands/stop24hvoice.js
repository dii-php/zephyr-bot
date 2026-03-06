const { SlashCommandBuilder } = require("discord.js");
const { getVoiceConnection } = require("@discordjs/voice");
const { QuickDB } = require("quick.db");

const db = new QuickDB();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("stop24hvoice")
        .setDescription("Stop 24/7 voice"),

    async execute(interaction) {

        const connection = getVoiceConnection(interaction.guild.id);

        if (connection) connection.destroy();

        await db.delete(`24hvoice_${interaction.guild.id}`);

        await interaction.reply("❌ 24/7 voice dimatikan.");
    }
};