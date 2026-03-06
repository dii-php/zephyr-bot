const { REST, Routes } = require("discord.js");
const { clientId, guildId, token } = require("../config");

module.exports = {
    name: "clientReady",
    once: true,
    async execute(client) {
        const { joinVoiceChannel } = require("@discordjs/voice");
const { voiceChannelId } = require("../config");

module.exports = {
    name: "clientReady",
    once: true,

    async execute(client) {

        console.log(`Bot aktif sebagai ${client.user.tag}`);

        const guild = client.guilds.cache.first();
        const channel = guild.channels.cache.get(voiceChannelId);

        if (!channel) return console.log("Voice channel tidak ditemukan.");

        joinVoiceChannel({
            channelId: channel.id,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
            selfDeaf: true
        });

        console.log(`🎧 Auto joined voice: ${channel.name}`);
    }
};

        console.log(`Bot aktif sebagai ${client.user.tag}`);

        const commands = [];
        client.commands.forEach(cmd => {
            commands.push(cmd.data.toJSON());
        });

        const rest = new REST({ version: "10" }).setToken(token);

        try {
            console.log("Auto registering slash commands...");

            await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
                { body: commands }
            );

            console.log("Slash command berhasil di-update.");
        } catch (error) {
            console.error(error);
        }
    }
};