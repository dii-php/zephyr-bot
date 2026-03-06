const { SlashCommandBuilder } = require("discord.js");
const checkCooldown = require("../utils/cooldown");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Check bot latency"),

    async execute(interaction) {
        if (checkCooldown(interaction.user.id)) {
            return interaction.reply({
                content: "Tunggu 5 detik sebelum menggunakan command lagi.",
                flags: 64
            });
        }
        await interaction.deferReply();
        const latency = Date.now() - interaction.createdTimestamp;
        await interaction.editReply(`🏓 Pong! Latency: ${latency}ms`);
    }
};