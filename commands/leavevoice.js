const { SlashCommandBuilder } = require("discord.js");
const { getVoiceConnection } = require("@discordjs/voice");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("leavevoice")
        .setDescription("Disconnect bot from voice channel"),

    async execute(interaction) {

        const connection = getVoiceConnection(interaction.guild.id);

        if (!connection) {
            return interaction.reply({
                content: "Bot tidak sedang berada di voice.",
                flags: 64
            });
        }

        connection.destroy();

        await interaction.reply("👋 Bot keluar dari voice channel.");
    }
};