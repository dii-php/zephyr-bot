const {
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const rods = require("../data/rods");
const baits = require("../data/bait");
const fishes = require("../data/fishes");
const User = require("../models/User");

module.exports = {
    name: "interactionCreate",
    async execute(interaction, client) {

        try {

            // =====================================
            // SLASH COMMAND
            // =====================================
            if (interaction.isChatInputCommand()) {
                const command = client.commands.get(interaction.commandName);
                if (!command) return;
                await command.execute(interaction);
                return;
            }

            // =====================================
            // SELECT MENU
            // =====================================
            if (interaction.isStringSelectMenu()) {

                // =====================================
                // SELECT USER ROD
                // =====================================
                if (interaction.customId === "select_user_rod") {

                    const index = parseInt(interaction.values[0]);
                    const user = await User.findOne({ userId: interaction.user.id });

                    if (!user.inventory.rods[index])
                        return interaction.update({
                            content: "Rod tidak ditemukan.",
                            components: [],
                            embeds: []
                        });

                    user.equippedRod = index;
                    await user.save();

                    return interaction.update({
                        content: "✅ Rod berhasil digunakan.",
                        components: [],
                        embeds: []
                    });
                }

                // =====================================
                // SELECT USER BAIT (FIXED)
                // =====================================
                if (interaction.customId === "select_user_bait") {

                    const baitId = interaction.values[0];
                    const user = await User.findOne({ userId: interaction.user.id });

                    if (!user)
                        return interaction.update({
                            content: "User tidak ditemukan.",
                            components: [],
                            embeds: []
                        });

                    const baitData = baits.find(b => b.id === baitId);
                    if (!baitData)
                        return interaction.update({
                            content: "Bait tidak valid.",
                            components: [],
                            embeds: []
                        });

                    // SIMPAN SEBAGAI ACTIVE BAIT
                    user.activeBait = baitId;
                    await user.save();

                    return interaction.update({
                        content: `✅ Kamu sekarang menggunakan **${baitData.name}** sebagai bait utama.`,
                        components: [],
                        embeds: []
                    });
                }

                // ===============================
                // SELL FISH SELECT (DARI /sell)
                // ===============================
                if (interaction.customId === "sell_fish_select") {

                    const itemName = interaction.values[0];
                    const user = await User.findOne({ userId: interaction.user.id });

                    if (!user?.inventory?.fishes?.[itemName])
                        return interaction.update({
                            content: "Item tidak ditemukan.",
                            components: [],
                            embeds: []
                        });

                    const amount = user.inventory.fishes[itemName];
                    const fishData = fishes.find(f => f.name === itemName);

                    if (!fishData)
                        return interaction.update({
                            content: "Data ikan tidak valid.",
                            components: [],
                            embeds: []
                        });

                    const embed = new EmbedBuilder()
                        .setTitle("🧾 Pilih Jumlah Penjualan")
                        .setColor(0xe67e22)
                        .setDescription(
                            `🐟 Item: **${itemName}**\n` +
                            `📦 Tersedia: **${amount}**\n` +
                            `💰 Harga: **$${fishData.value} / item**`
                        );

                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId(`sell_qty|${itemName}|1`)
                            .setLabel("Jual 1")
                            .setStyle(ButtonStyle.Primary),

                        new ButtonBuilder()
                            .setCustomId(`sell_qty|${itemName}|half`)
                            .setLabel("Jual 50%")
                            .setStyle(ButtonStyle.Secondary),

                        new ButtonBuilder()
                            .setCustomId(`sell_qty|${itemName}|all`)
                            .setLabel("Sell All")
                            .setStyle(ButtonStyle.Success),

                        new ButtonBuilder()
                            .setCustomId("sell_cancel")
                            .setLabel("Cancel")
                            .setStyle(ButtonStyle.Danger)
                    );

                    return interaction.update({
                        embeds: [embed],
                        components: [row],
                        content: ""
                    });
                }

                // ===============================
                // SHOP CATEGORY
                // ===============================
                if (interaction.customId === "shop_main") {

                    const selected = interaction.values[0];

                    if (selected === "fish") {

                        const embed = new EmbedBuilder()
                            .setTitle("🎣 Fishing Shop")
                            .setColor(0x3498db)
                            .setDescription(
                                "🪝 **Rod** → Durability & Luck\n" +
                                "🪱 **Bait** → Boost rarity chance\n\n" +
                                "Pembelian bait langsung dapat 100."
                            );

                        const rodMenu = new StringSelectMenuBuilder()
                            .setCustomId("buy_rod")
                            .setPlaceholder("🪝 Beli Rod")
                            .addOptions(
                                rods.map(r => ({
                                    label: `${r.name} - $${r.price}`,
                                    description: `Durability ${r.maxDurability} | Luck +${r.luckBonus}`,
                                    value: r.id
                                }))
                            );

                        const baitMenu = new StringSelectMenuBuilder()
                            .setCustomId("buy_bait")
                            .setPlaceholder("🪱 Beli Bait")
                            .addOptions(
                                baits.map(b => ({
                                    label: `${b.name} - $${b.price}`,
                                    description: `Luck +${b.rarityBoost}`,
                                    value: b.id
                                }))
                            );

                        return interaction.update({
                            embeds: [embed],
                            components: [
                                new ActionRowBuilder().addComponents(rodMenu),
                                new ActionRowBuilder().addComponents(baitMenu)
                            ]
                        });
                    }

                    if (selected === "hunt") {
                        return interaction.update({
                            content: "🏹 Hunting shop segera hadir.",
                            components: [],
                            embeds: []
                        });
                    }
                }

            }

            // =====================================
            // BUTTON HANDLER
            // =====================================
            if (interaction.isButton()) {

                if (interaction.customId === "sell_cancel")
                    return interaction.update({
                        content: "Penjualan dibatalkan.",
                        components: [],
                        embeds: []
                    });

                if (interaction.customId.startsWith("sell_confirm")) {

                    const [, itemName, amountStr] = interaction.customId.split("|");
                    const amount = parseInt(amountStr);

                    const user = await User.findOne({ userId: interaction.user.id });
                    const fishData = fishes.find(f => f.name === itemName);

                    user.money += fishData.value * amount;
                    user.inventory.fishes[itemName] -= amount;

                    if (user.inventory.fishes[itemName] <= 0)
                        delete user.inventory.fishes[itemName];

                    await user.save();

                    const embed = new EmbedBuilder()
                        .setTitle("✅ Penjualan Berhasil")
                        .setColor(0x2ecc71)
                        .setDescription(
                            `Terjual: **${itemName} x${amount}**\n` +
                            `Saldo sekarang: **$${user.money}**`
                        );

                    return interaction.update({
                        embeds: [embed],
                        components: [],
                        content: ""
                    });
                }
            }

        } catch (error) {
            console.error(error);

            if (interaction.deferred || interaction.replied)
                await interaction.editReply({ content: "Terjadi error." });
            else
                await interaction.reply({ content: "Terjadi error.", ephemeral: true });
        }
    }
};