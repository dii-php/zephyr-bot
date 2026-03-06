const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType
} = require("discord.js");

const { QuickDB } = require("quick.db");
const db = new QuickDB();
const checkCooldown = require("../utils/cooldown");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("warns")
        .setDescription("Manage warnings")
        .addSubcommand(s =>
            s.setName("list")
             .setDescription("List warns user")
             .addUserOption(o => o.setName("user").setDescription("Target").setRequired(true))
        )
        .addSubcommand(s =>
            s.setName("remove")
             .setDescription("Remove specific warn")
             .addUserOption(o => o.setName("user").setDescription("Target").setRequired(true))
             .addIntegerOption(o => o.setName("warning").setDescription("Warn ID").setRequired(true))
        )
        .addSubcommand(s =>
            s.setName("all")
             .setDescription("List all warned users")
        )
        .addSubcommand(s =>
            s.setName("clear")
             .setDescription("Clear user warns")
             .addUserOption(o => o.setName("user").setDescription("Target").setRequired(true))
        )
        .addSubcommand(s =>
            s.setName("clearall")
             .setDescription("Clear all warns in server")
        ),

    async execute(interaction) {
        if (checkCooldown(interaction.user.id)) {
            return interaction.reply({
                content: "Tunggu 5 detik sebelum menggunakan command lagi.",
                flags: 64
            });
        }

        await interaction.deferReply();
        const guild = interaction.guild;
        const sub = interaction.options.getSubcommand();

        // ==== LIST WITH PAGINATION ====
        if (sub === "list") {

            const target = interaction.options.getUser("user");
            const warns = await db.get(`warns_${guild.id}_${target.id}`) || [];

            if (warns.length === 0)
                return interaction.editReply({ content: "User tidak punya warning.", flags: 64 });

            const warnsPerPage = 5;
            const totalPages = Math.ceil(warns.length / warnsPerPage);
            let page = 0;

            const generateEmbed = (pageIndex) => {

                const start = pageIndex * warnsPerPage;
                const end = start + warnsPerPage;
                const currentWarns = warns.slice(start, end);

                const warnText = currentWarns.map(w =>
`### Case #${w.userCase}

> **User:** ${target.username} (\`${target.id}\`)
> **Moderator:** <@${w.moderator}> (\`${w.moderator}\`)
> **Reason:** ${w.reason}
> **Date:** <t:${w.date}:F>`
                ).join("\n\n");

                return new EmbedBuilder()
                    .setColor(0xC147E9)
                    .setAuthor({
                        name: target.username,
                        iconURL: target.displayAvatarURL({ dynamic: true })
                    })
                    .setDescription(`<@${target.id}> (\`${target.id}\`)\n\n${warnText}`)
                    .setThumbnail(target.displayAvatarURL({ dynamic: true }))
                    .setFooter({ text: `Page ${pageIndex + 1} of ${totalPages}` });
            };

            let components = [];

            if (totalPages === 1) {
                components = [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId("clearall")
                            .setLabel("🗑 Clear All")
                            .setStyle(ButtonStyle.Danger)
                    )
                ];
            } else {
                components = [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId("prev").setLabel("◀").setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder().setCustomId("next").setLabel("▶").setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder().setCustomId("close").setLabel("❌").setStyle(ButtonStyle.Danger),
                        new ButtonBuilder().setCustomId("clearall").setLabel("🗑 Clear All").setStyle(ButtonStyle.Danger)
                    )
                ];
            }

            const msg = await interaction.editReply({
                embeds: [generateEmbed(page)],
                components
            });

            const collector = msg.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: 60000
            });

            collector.on("collect", async i => {

                if (i.user.id !== interaction.user.id)
                    return i.reply({ content: "Kamu tidak bisa menggunakan tombol ini.", flags: 64 });

                if (i.customId === "prev")
                    page = page > 0 ? --page : totalPages - 1;

                if (i.customId === "next")
                    page = page + 1 < totalPages ? ++page : 0;

                if (i.customId === "close") {
                    collector.stop();
                    return i.update({ content: "Menu ditutup.", embeds: [], components: [] });
                }

                if (i.customId === "clearall") {
                    await db.delete(`warns_${guild.id}_${target.id}`);
                    collector.stop();
                    return i.update({ content: "Semua warning user dihapus.", embeds: [], components: [] });
                }

                await i.update({
                    embeds: [generateEmbed(page)],
                    components
                });
            });

            return;
        }

        // ==== REMOVE ====
        if (sub === "remove") {
            const target = interaction.options.getUser("user");
            const warnId = interaction.options.getInteger("warning");
            const key = `warns_${guild.id}_${target.id}`;
            let warns = await db.get(key) || [];
            warns = warns.filter(w => w.id !== warnId);
            await db.set(key, warns);
            return interaction.editReply({ content: "Warn berhasil dihapus.", flags: 64 });
        }

        // ==== ALL ====
        if (sub === "all") {
            const all = await db.all();
            const filtered = all.filter(entry =>
                entry.id.startsWith(`warns_${guild.id}_`) && entry.value.length > 0
            );

            if (filtered.length === 0)
                return interaction.editReply({ content: "Tidak ada warn di server.", flags: 64 });

            const result = filtered.map(entry => {
                const userId = entry.id.split("_")[2];
                return `<@${userId}> — ${entry.value.length} warn`;
            }).join("\n");

            return interaction.editReply({ content: result, flags: 64 });
        }

        // ==== CLEAR USER ====
        if (sub === "clear") {
            const target = interaction.options.getUser("user");
            await db.delete(`warns_${guild.id}_${target.id}`);
            return interaction.editReply({ content: "Semua warn user dihapus.", flags: 64 });
        }

        // ==== CLEAR ALL SERVER ====
        if (sub === "clearall") {
            const all = await db.all();
            const filtered = all.filter(entry => entry.id.startsWith(`warns_${guild.id}_`));
            for (const entry of filtered) {
                await db.delete(entry.id);
            }
            return interaction.editReply({ content: "Semua warn server dihapus.", flags: 64 });
        }
    }
};