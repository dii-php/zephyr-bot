const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },

    money: { type: Number, default: 500 },

    activeBait: { type: String, default: "worm" },

    inventory: {
    fishes: { type: Object, default: {} },
    rods: { type: Array, default: ["foragers_pole"] },
    bait: { type: Array, default: [] }
    },

    fishing: {
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 }
    },

    bait: {
        type: Map,
        of: Number,
        default: {}
    },

    rod: {
        name: { type: String, default: "Basic Rod" },
        rarity: { type: String, default: "Common" },
        level: { type: Number, default: 1 },
        durability: { type: Number, default: 100 },
        maxDurability: { type: Number, default: 100 },
        luckBonus: { type: Number, default: 0 }
    },

    weapon: {
        level: { type: Number, default: 1 },
        durability: { type: Number, default: 100 }
    },

    stats: {
        huntCount: { type: Number, default: 0 },
        fishCount: { type: Number, default: 0 }
    }
});

module.exports = mongoose.model("User", userSchema);