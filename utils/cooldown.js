const cooldowns = new Map();

function checkCooldown(userId, commandName, cooldownTime) {

    const now = Date.now();

    if (!cooldowns.has(commandName)) {
        cooldowns.set(commandName, new Map());
    }

    const commandCooldown = cooldowns.get(commandName);

    if (commandCooldown.has(userId)) {
        const expiration = commandCooldown.get(userId) + cooldownTime;

        if (now < expiration) {
            return Math.ceil((expiration - now) / 1000);
        }
    }

    commandCooldown.set(userId, now);
    return 0;
}

module.exports = checkCooldown;