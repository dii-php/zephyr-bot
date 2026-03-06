const { joinVoiceChannel, getVoiceConnection } = require("@discordjs/voice");
const { voiceChannelId } = require("../config");

module.exports = {
    name: "voiceStateUpdate",

    async execute(oldState, newState) {

        const guild = newState.guild;
        const connection = getVoiceConnection(guild.id);

        if (!connection) {

            const channel = guild.channels.cache.get(voiceChannelId);
            if (!channel) return;

            joinVoiceChannel({
                channelId: channel.id,
                guildId: guild.id,
                adapterCreator: guild.voiceAdapterCreator,
                selfDeaf: true
            });

            console.log("Bot reconnected ke voice.");
        }
    }
};