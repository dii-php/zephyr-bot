const { SlashCommandBuilder } = require("discord.js");
const User = require("../models/User");
const checkCooldown = require("../utils/cooldown");

const COOLDOWN = 60 * 1000;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("hunt")
        .setDescription("Berburu hewan"),

    async execute(interaction) {

        const remaining = checkCooldown(interaction.user.id, "hunt", COOLDOWN);
        if (remaining > 0)
            return interaction.reply({ content: `⏳ ${remaining} detik lagi.`, ephemeral: true });

        let user = await User.findOne({ userId: interaction.user.id });
        if (!user) user = await User.create({ userId: interaction.user.id });

        if (user.weapon.durability <= 0)
            return interaction.reply("❌ Senjata rusak!");

        const reward = Math.floor(Math.random() * 200) + 50;

        user.money += reward;
        user.weapon.durability -= 10;
        user.stats.huntCount++;

        await user.save();

        interaction.reply(`🏹 Kamu berburu dan mendapat $${reward}`);
    }
};