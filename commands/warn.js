const { SlashCommandBuilder } = require("discord.js");
const { QuickDB } = require("quick.db");
const sendDM = require("../utils/sendDM");
const logAction = require("../utils/logger");
const checkCooldown = require("../utils/cooldown");

const db = new QuickDB();

const notifyChoices = [
    { name: "Notify with the reason", value: "notify_with_reason" },
    { name: "Notify without the reason", value: "notify_without_reason" },
    { name: "Don't notify", value: "dont_notify" }
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName("warn")
        .setDescription("Warn a member")
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
        const user = interaction.options.getUser("target");
        const reason = interaction.options.getString("reason");
        const notifyOption = interaction.options.getString("notify");
        const visual = interaction.options.getBoolean("visual");

        const warnKey = `warns_${guild.id}_${user.id}`;

        // Global case
        const globalCase = await db.add(`case_${guild.id}`, 1);

        // Ambil warn user sebelumnya
        const userWarns = await db.get(warnKey) || [];

        // Case per user (panjang array + 1)
        const userCase = userWarns.length + 1;

        const newWarn = {
            globalCase,
            userCase,
            moderator: moderator.id,
            reason,
            date: Math.floor(Date.now()/1000)
        };

        userWarns.push(newWarn);
        await db.set(warnKey, userWarns);

        await sendDM(user, "Warn", reason, guild, moderator, notifyOption);
        await logAction(guild, "Warn", user, moderator, reason);

        const publicMsg = `😍 <@${user.id}> was warned!\n> **Reason:** ${reason}`;

        if (visual) {
            return interaction.editReply(publicMsg);
        } else {
            return interaction.editReply({ content: "User warned.", flags: 64 });
        }
    }
};