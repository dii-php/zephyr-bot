const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const User = require("../models/User");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sell")
    .setDescription("Jual item dari inventory"),

  async execute(interaction) {

    const user = await User.findOne({ userId: interaction.user.id });

    if (!user)
      return interaction.reply({
        content: "Kamu belum punya data.",
        ephemeral: true
      });

    const fishInventory = user.inventory.fishes || {};

    if (Object.keys(fishInventory).length === 0)
      return interaction.reply({
        content: "❌ Tidak ada ikan untuk dijual.",
        ephemeral: true
      });

    const options = Object.keys(fishInventory).map(name => ({
      label: `${name} x${fishInventory[name]}`,
      value: name
    }));

    const select = new StringSelectMenuBuilder()
      .setCustomId("sell_fish_select")
      .setPlaceholder("Pilih ikan untuk dijual")
      .addOptions(options);

    const selectRow = new ActionRowBuilder().addComponents(select);

    const sellAllButton = new ButtonBuilder()
      .setCustomId("sell_all_inventory")
      .setLabel("💰 Sell ALL Inventory")
      .setStyle(ButtonStyle.Danger);

    const buttonRow = new ActionRowBuilder().addComponents(sellAllButton);

    const embed = new EmbedBuilder()
      .setTitle("💰 Sell Fish")
      .setColor(0xf1c40f)
      .setDescription(
        "Pilih ikan yang ingin kamu jual.\n\n" +
        "Atau tekan **Sell ALL Inventory** untuk menjual semua ikan sekaligus."
      );

    return interaction.reply({
      embeds: [embed],
      components: [selectRow, buttonRow],
      ephemeral: true
    });
  }
};