const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const User = require("../models/User");
const fishes = require("../data/fishes");
const rods = require("../data/rods");
const baits = require("../data/bait");
const checkCooldown = require("../utils/cooldown");

const COOLDOWN = 5 * 1000;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("fish")
        .setDescription("Memancing ikan"),

    async execute(interaction) {

        const remaining = checkCooldown(interaction.user.id, "fish", COOLDOWN);
        if (remaining > 0)
            return interaction.reply({
                content: `⏳ ${remaining} detik lagi.`,
                ephemeral: true
            });

        let user = await User.findOne({ userId: interaction.user.id });
        if (!user) {
            user = await User.create({
                userId: interaction.user.id,
                money: 500
            });
        }

        // ===== CHECK BAIT =====
        if (!user.inventory.bait || user.inventory.bait.length === 0)
            return interaction.reply({
                content: "❌ Kamu tidak punya bait!",
                ephemeral: true
            });

        // ===== CHECK ROD =====
        if (!user.inventory.rods || user.inventory.rods.length === 0)
            return interaction.reply({
                content: "❌ Kamu tidak punya rod!",
                ephemeral: true
            });

// ===== CONSUME BAIT =====

let usedBaitId = null;

// Pastikan activeBait ada di inventory
if (user.activeBait) {

    const baitIndex = user.inventory.bait.findIndex(
        b => b === user.activeBait
    );

    if (baitIndex !== -1) {
        usedBaitId = user.inventory.bait.splice(baitIndex, 1)[0];
    } else {
        // Kalau bait pilihan sudah habis
        user.activeBait = null;
    }
}

// Kalau belum pilih bait sama sekali
if (!usedBaitId) {

    if (user.inventory.bait.length === 0) {
        return interaction.reply({
            content: "❌ Kamu tidak punya bait!",
            ephemeral: true
        });
    }

    // pakai bait pertama
    usedBaitId = user.inventory.bait.shift();
}

await user.save();

const usedBait = baits.find(b => b.id === usedBaitId);

        // ===== RANDOM FISH =====
        const totalChance = fishes.reduce((a, f) => a + f.chance, 0);
        let rand = Math.random() * totalChance;
        let cumulative = 0;

        let caughtFish = null;
        for (const fish of fishes) {
            cumulative += fish.chance;
            if (rand <= cumulative) {
                caughtFish = fish;
                break;
            }
        }

        if (!caughtFish) return;

        // ===== SAVE INVENTORY =====
        if (!user.inventory.fishes[caughtFish.name])
            user.inventory.fishes[caughtFish.name] = 0;

        user.inventory.fishes[caughtFish.name] += 1;
        user.stats.fishCount += 1;

        await user.save();

        const embed = new EmbedBuilder()
            .setTitle("🎣 Kamu Mendapatkan Ikan!")
            .setColor(0x3498db)
            .addFields(
                { name: "🐟 Ikan", value: caughtFish.name },
                { name: "⭐ Rarity", value: caughtFish.rarity, inline: true },
                { name: "💰 Value", value: `$${caughtFish.value}`, inline: true },
                { name: "🪱 Bait Dipakai", value: usedBait?.name || "Unknown", inline: true },
                { name: "🎒 Total Ikan Ini", value: `${user.inventory.fishes[caughtFish.name]}`, inline: true }
            );

        return interaction.reply({ embeds: [embed] });
    }
};