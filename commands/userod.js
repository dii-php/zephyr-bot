const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder
} = require("discord.js");

const User = require("../models/User");
const rods = require("../data/rods");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("userod")
    .setDescription("Pilih rod yang ingin digunakan"),

  async execute(interaction) {

    const user = await User.findOne({ userId: interaction.user.id });

    if (!user?.inventory?.rods?.length)
      return interaction.reply({
        content: "❌ Kamu tidak punya rod.",
        ephemeral: true
      });

    // Jika masih format lama (string id), convert otomatis
    if (typeof user.inventory.rods[0] === "string") {
      user.inventory.rods = user.inventory.rods.map(id => {
        const rodData = rods.find(r => r.id === id);
        return {
          id: id,
          durability: rodData ? rodData.maxDurability : 100
        };
      });

      await user.save();
    }

    const options = user.inventory.rods.map((rodObj, index) => {

      const rodData = rods.find(r => r.id === rodObj.id);
      if (!rodData) return null;

      const durabilityPercent = Math.floor(
        (rodObj.durability / rodData.maxDurability) * 100
      );

      return {
        label: `${rodData.name} (${rodObj.durability}/${rodData.maxDurability})`,
        description: `Luck +${rodData.luckBonus} | ${durabilityPercent}% durability`,
        value: index.toString()
      };
    }).filter(Boolean);

    const select = new StringSelectMenuBuilder()
      .setCustomId("select_user_rod")
      .setPlaceholder("Pilih rod aktif")
      .addOptions(options);

    const row = new ActionRowBuilder().addComponents(select);

    const embed = new EmbedBuilder()
      .setTitle("🪝 Pilih Rod Aktif")
      .setColor(0x3498db)
      .setDescription("Durability rod tidak akan reset saat dipilih.");

    return interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true
    });
  }
};