const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("shop")
    .setDescription("Buka shop"),

  async execute(interaction) {

    const embed = new EmbedBuilder()
      .setTitle("🛒 Zephyr")
      .setColor(0x2c3e50)
      .setDescription("Pilih kategori yang ingin kamu buka.");

    const menu = new StringSelectMenuBuilder()
      .setCustomId("shop_main")
      .setPlaceholder("Pilih kategori...")
      .addOptions([
        { label: "🎣 Fishing Shop", value: "fish" },
        { label: "🏹 Hunting Shop", value: "hunt" }
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.reply({
      embeds: [embed],
      components: [row]
    });
  }
};