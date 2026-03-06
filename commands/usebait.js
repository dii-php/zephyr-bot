const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder
} = require("discord.js");

const User = require("../models/User");
const baits = require("../data/bait");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("usebait")
    .setDescription("Pilih bait yang ingin diprioritaskan"),

  async execute(interaction) {

    const user = await User.findOne({ userId: interaction.user.id });

    if (!user?.inventory?.bait?.length)
      return interaction.reply({
        content: "❌ Kamu tidak punya bait.",
        ephemeral: true
      });

    // Hitung jumlah bait
    const baitCounts = {};
    user.inventory.bait.forEach(id => {
      baitCounts[id] = (baitCounts[id] || 0) + 1;
    });

    // Buat select options
    const options = Object.keys(baitCounts).map(id => {
      const bait = baits.find(b => b.id === id);
      if (!bait) return null;

      return {
        label: `${bait.name} x${baitCounts[id]}`,
        description: `Luck +${bait.rarityBoost}`,
        value: id
      };
    }).filter(Boolean);

    if (!options.length)
      return interaction.reply({
        content: "❌ Tidak ada bait valid.",
        ephemeral: true
      });

    const select = new StringSelectMenuBuilder()
      .setCustomId("select_user_bait")
      .setPlaceholder("Pilih bait default")
      .addOptions(options);

    const row = new ActionRowBuilder().addComponents(select);

    const embed = new EmbedBuilder()
      .setTitle("🪱 Pilih Bait")
      .setDescription("Pilih bait yang ingin kamu gunakan sebagai default saat fishing.")
      .setColor(0xe67e22);

    return interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true
    });
  }
};