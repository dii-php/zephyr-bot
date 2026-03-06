const { SlashCommandBuilder } = require("discord.js");
const { joinVoiceChannel } = require("@discordjs/voice");
const { voiceChannelId } = require("../config");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("24hvoice")
        .setDescription("Activate 24/7 voice keeper"),

    async execute(interaction) {

        const guild = interaction.guild;
        const channel = guild.channels.cache.get(voiceChannelId);

        if (!channel) {
            return interaction.reply({
                content: "Voice channel tidak ditemukan di config.",
                flags: 64
            });
        }

        joinVoiceChannel({
            channelId: channel.id,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
            selfDeaf: true
        });

        await interaction.reply(`🎧 Bot sekarang menjaga voice **${channel.name}**.`);
    }
};