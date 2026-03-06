const { EmbedBuilder } = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

async function logAction(guild, action, user, moderator, reason) {

    const logChannelId = await db.get(`log_${guild.id}`);
    if (!logChannelId) return;

    const channel = guild.channels.cache.get(logChannelId);
    if (!channel) return;

    const caseNumber = await db.get(`case_${guild.id}`);

    const embed = new EmbedBuilder()
        .setColor(0xC147E9)
        .setAuthor({
            name: user.tag,
            iconURL: user.displayAvatarURL({ dynamic: true })
        })
        .setDescription(`### Case #${caseNumber}`)
        .addFields(
            { name: "Action", value: action, inline: true },
            { name: "User", value: `<@${user.id}> (\`${user.id}\`)`, inline: false },
            { name: "Moderator", value: `<@${moderator.id}> (\`${moderator.id}\`)`, inline: false },
            { name: "Reason", value: reason, inline: false },
            { name: "Date", value: `<t:${Math.floor(Date.now()/1000)}:F>` }
        )
        .setFooter({
            text: guild.name,
            iconURL: guild.iconURL() || moderator.displayAvatarURL()
        })
        .setTimestamp();

    await channel.send({ embeds: [embed] });
}

module.exports = logAction;