const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
    name: "clientReady",
    async execute(client) {

        const all = await db.all();
        const tempbans = all.filter(e => e.id.startsWith("tempban_"));

        for (const entry of tempbans) {

            const { guildId, userId, endTime } = entry.value;
            const guild = client.guilds.cache.get(guildId);
            if (!guild) continue;

            const remaining = endTime - Date.now();

            if (remaining <= 0) {
                await guild.members.unban(userId).catch(() => {});
                await db.delete(entry.id);
            } else {
                setTimeout(async () => {
                    await guild.members.unban(userId).catch(() => {});
                    await db.delete(entry.id);
                }, remaining);
            }
        }
    }
};