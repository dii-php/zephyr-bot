const { EmbedBuilder } = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

async function sendDM(user, action, reason, guild, moderator, notifyType) {

    if (notifyType === "dont_notify") return;

    const caseNumber = await db.add(`case_${guild.id}`, 1);

    const embed = new EmbedBuilder()
        .setColor(0xC147E9)
        .setAuthor({
            name: user.tag,
            iconURL: user.displayAvatarURL({ dynamic: true })
        })
        .setDescription(`### Case #${caseNumber}`)
        .addFields(
            { name: "Action", value: action, inline: true },
            { name: "User", value: `<@${user.id}>\n\`${user.id}\``, inline: true },
            { name: "Moderator", value: `<@${moderator.id}>\n\`${moderator.id}\``, inline: true },
            { name: "Reason", value: notifyType === "notify_with_reason" ? reason : "Not specified" },
            { name: "Date", value: `<t:${Math.floor(Date.now()/1000)}:F>` }
        )
        .setFooter({
            text: guild.name,
            iconURL: guild.iconURL() || moderator.displayAvatarURL()
        })
        .setTimestamp();

    try {
        await user.send({ embeds: [embed] });
    } catch {}
}

module.exports = sendDM;