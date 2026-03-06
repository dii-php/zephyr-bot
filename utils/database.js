const mongoose = require("mongoose");
const { mongoURI } = require("../config");

async function connectDB() {
    try {
        // Add modern mongoose connection options
        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds if can't connect
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            maxPoolSize: 10, // Maintain up to 10 socket connections
            family: 4, // Use IPv4, skip trying IPv6
            retryWrites: true,
            retryReads: true
        });
        
        console.log("MongoDB Connected");
        
        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected. Attempting to reconnect...');
        });
        
        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected');
        });
        
    } catch (error) {
        console.error("MongoDB Connection Error:", error.message);
        console.log("Continuing without MongoDB - some features may not work");
    }
}

module.exports = connectDB;
