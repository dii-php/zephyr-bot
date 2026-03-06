const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const sendDM = require("../utils/sendDM");
const parseDuration = require("../utils/parseDuration");
const checkCooldown = require("../utils/cooldown");
const logAction = require("../utils/logger");

const notifyChoices = [
    { name: "Notify with the reason", value: "notify_with_reason" },
    { name: "Notify without the reason", value: "notify_without_reason" },
    { name: "Don't notify", value: "dont_notify" }
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName("tempban")
        .setDescription("Temporary ban a member")
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption(o => o.setName("target").setDescription("User").setRequired(true))
        .addStringOption(o => o.setName("duration").setDescription("Example: 10s, 5m, 1d").setRequired(true))
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
        const durationInput = interaction.options.getString("duration");
        const reason = interaction.options.getString("reason");
        const notifyOption = interaction.options.getString("notify");
        const visual = interaction.options.getBoolean("visual");

        const duration = parseDuration(durationInput);

        if (!duration)
            return interaction.editReply({ content: "Format durasi salah. Gunakan 10s / 5m / 1d", flags: 64 });

        if (!member.bannable)
            return interaction.editReply({ content: "Saya tidak bisa ban user ini.", flags: 64 });

        await sendDM(user, "Temp Ban", reason, guild, moderator, notifyOption);
        await logAction(guild, "Temp Ban", user, moderator, reason);
        await member.ban({ reason });

        const { QuickDB } = require("quick.db");
        const db = new QuickDB();

        const endTime = Date.now() + duration;

        await db.set(`tempban_${guild.id}_${user.id}`, {
            guildId: guild.id,
            userId: user.id,
            endTime
        });

        const msg = `⏳ <@${user.id}> was temporarily banned!\n> **Duration:** ${durationInput}\n> **Reason:** ${reason}`;

        if (visual) return interaction.editReply(msg);
        return interaction.editReply({ content: "User temp banned.", flags: 64 });
    }
};