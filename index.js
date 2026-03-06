const { Client, GatewayIntentBits, Collection, REST, Routes } = require("discord.js");
const fs = require("fs");
const { token, clientId, guildId } = require("./config");
const connectDB = require("./utils/database");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();

// ===== LOAD COMMANDS =====
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

// ===== AUTO REGISTER FUNCTION =====
async function registerCommands() {

    const commands = [];

    client.commands.forEach(command => {
    console.log("Registering command:", command.data.name);
    commands.push(command.data.toJSON());
    });

    const rest = new REST({ version: "10" }).setToken(token);

    try {
        console.log("Auto registering slash commands...");

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands }
        );

        console.log("Slash commands berhasil di-update.");
    } catch (error) {
        console.error(error);
    }
}

// ===== LOAD EVENTS =====
const eventFiles = fs.readdirSync("./events").filter(file => file.endsWith(".js"));

for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

// ===== READY EVENT UNTUK AUTO REGISTER =====
client.once("clientReady", async () => {
    console.log(`Bot aktif sebagai ${client.user.tag}`);
    await registerCommands();
});

connectDB();
client.login(token);