const mongoose = require("mongoose");
const dns = require("dns");

// Configure public DNS resolvers (Google DNS + Cloudflare) to prevent querySrv ECONNREFUSED on MongoDB Atlas SRV records
try {
    dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (dnsErr) {
    console.warn("Could not set custom DNS servers, using system default:", dnsErr.message);
}

const connectToDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connected successfully!");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        throw error;
    }
};

module.exports = connectToDB;
