const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const sendDM = require("../utils/sendDM");
const checkCooldown = require("../utils/cooldown");
const logAction = require("../utils/logger");

const notifyChoices = [
    { name: "Notify with the reason", value: "notify_with_reason" },
    { name: "Notify without the reason", value: "notify_without_reason" },
    { name: "Don't notify", value: "dont_notify" }
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Kick a member")
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addUserOption(o => o.setName("target").setDescription("User").setRequired(true))
        .addStringOption(o => o.setName("reason").setDescription("Reason").setRequired(true))
        .addStringOption(o => o.setName("notify").setDescription("Notify option").setRequired(true).addChoices(...notifyChoices))
        .addBooleanOption(o => o.setName("visual").setDescription("Public message?").setRequired(true)),

    async execute(interaction) {
        if (checkCooldown(interaction.user.id)) {
            return interaction.reply({
                content: "Tunggu 5 detik sebelum menggunakan command lagi.",
                flags: 64
            });
        }

        await interaction.deferReply();

        const guild = interaction.guild;
        const moderator = interaction.user;
        const member = interaction.options.getMember("target");
        const user = interaction.options.getUser("target");
        const reason = interaction.options.getString("reason");
        const notifyOption = interaction.options.getString("notify");
        const visual = interaction.options.getBoolean("visual");

        if (!member.kickable)
            return interaction.editReply({ content: "Saya tidak bisa kick user ini.", flags: 64 });

        await sendDM(user, "Kick", reason, guild, moderator, notifyOption);
        await logAction(guild, "Kick", user, moderator, reason);
        await member.kick(reason);

        const msg = `👢 <@${user.id}> was kicked!\n> **Reason:** ${reason}`;

        if (visual) return interaction.editReply(msg);
        return interaction.editReply({ content: "User kicked.", flags: 64 });
    }
};