const { SlashCommandBuilder } = require("discord.js");
const User = require("../models/User");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("repair")
        .setDescription("Repair pancing")
        .addStringOption(option =>
            option.setName("type")
                .setDescription("rod / weapon")
                .setRequired(true)),

    async execute(interaction) {

        const type = interaction.options.getString("type");
        const user = await User.findOne({ userId: interaction.user.id });

        const cost = 200;

        if (user.money < cost)
            return interaction.reply("❌ Uang tidak cukup.");

        if (type === "rod") user.rod.durability = 100;
        if (type === "weapon") user.weapon.durability = 100;

        user.money -= cost;
        await user.save();

        interaction.reply(`🔧 ${type} berhasil diperbaiki.`);
    }
};