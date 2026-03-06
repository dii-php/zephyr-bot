function parseDuration(input) {
    const match = input.match(/^(\d+)([smd])$/);
    if (!match) return null;

    const value = parseInt(match[1]);
    const unit = match[2];

    if (unit === "s") return value * 1000;
    if (unit === "m") return value * 60 * 1000;
    if (unit === "d") return value * 24 * 60 * 60 * 1000;

    return null;
}

module.exports = parseDuration;