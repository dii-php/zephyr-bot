const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const checkCooldown = require("../utils/cooldown");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setlog")
        .setDescription("Set log channel")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(o =>
            o.setName("channel")
             .setDescription("Log channel")
             .setRequired(true)
        ),

    async execute(interaction) {
        if (checkCooldown(interaction.user.id)) {
            return interaction.reply({
                content: "Tunggu 5 detik sebelum menggunakan command lagi.",
                flags: 64
            });
        }

        const channel = interaction.options.getChannel("channel");

        await db.set(`log_${interaction.guild.id}`, channel.id);

        await interaction.reply({
            content: `Log channel diset ke ${channel}`,
            flags: 64
        });
    }
};