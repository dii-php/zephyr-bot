const mongoose = require("mongoose");

const marketSchema = new mongoose.Schema({
    sellerId: String,
    item: String,
    price: Number,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Market", marketSchema);