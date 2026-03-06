const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const User = require("../models/User");
const rods = require("../data/rods");
const baits = require("../data/bait");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("inventory")
        .setDescription("Lihat inventory kamu"),

    async execute(interaction) {

        const user = await User.findOne({ userId: interaction.user.id });

        if (!user) {
            return interaction.reply({
                content: "Kamu belum punya data.",
                flags: 64
            });
        }

        const fishInventory = user.inventory.fishes || {};
        const rodInventory = user.inventory.rods || [];
        const baitInventory = user.inventory.bait || [];

        const embed = new EmbedBuilder()
            .setTitle(`🎒 Inventory ${interaction.user.username}`)
            .setColor(0x2ecc71)
            .addFields(
                {
                    name: "💰 Money",
                    value: `$${user.money}`,
                    inline: false
                }
            );

        // ========================
        // FISHES
        // ========================
        if (Object.keys(fishInventory).length > 0) {
            let fishText = "";

            for (const fish in fishInventory) {
                fishText += `${fish} x${fishInventory[fish]}\n`;
            }

            embed.addFields({
                name: "🐟 Fishes",
                value: fishText,
                inline: false
            });
        }

        // ========================
        // RODS (with quantity)
        // ========================
        if (rodInventory.length > 0) {
            // Count rods by id
            const rodCounts = {};
            rodInventory.forEach(id => {
                rodCounts[id] = (rodCounts[id] || 0) + 1;
            });

            let rodText = "";
            for (const [rodId, count] of Object.entries(rodCounts)) {
                const rod = rods.find(r => r.id === rodId);
                if (rod) rodText += `${rod.name} (${rod.rarity}) x${count}\n`;
            }

            embed.addFields({
                name: "🪝 Rods",
                value: rodText || "-",
                inline: false
            });
        }

        // ========================
        // BAITS (with count)
        // ========================
        if (baitInventory.length > 0) {
            // Count baits by id
            const baitCounts = {};
            baitInventory.forEach(id => {
                baitCounts[id] = (baitCounts[id] || 0) + 1;
            });

            let baitText = "";
            for (const [baitId, count] of Object.entries(baitCounts)) {
                const bait = baits.find(b => b.id === baitId);
                if (bait) baitText += `${bait.name} x${count}\n`;
            }

            embed.addFields({
                name: "🪱 Baits",
                value: baitText || "-",
                inline: false
            });
        }

        return interaction.reply({
            embeds: [embed]
        });
    }
};
