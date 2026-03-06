const { SlashCommandBuilder } = require("discord.js");
const { joinVoiceChannel } = require("@discordjs/voice");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("afkvoice")
        .setDescription("Make the bot join your voice channel and stay there"),

    async execute(interaction) {

        const channel = interaction.member.voice.channel;

        if (!channel) {
            return interaction.reply({
                content: "Kamu harus berada di voice channel dulu.",
                flags: 64
            });
        }

        try {

            joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
                selfDeaf: true
            });

            await interaction.reply({
                content: `🎧 Bot sekarang stay di voice **${channel.name}**`
            });

        } catch (err) {

            console.error(err);

            await interaction.reply({
                content: "Gagal join voice channel.",
                flags: 64
            });
        }
    }
};