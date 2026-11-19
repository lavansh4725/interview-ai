const path = require("path");
const dns = require("dns");

// Configure public DNS resolvers to prevent ECONNREFUSED on MongoDB Atlas SRV lookups
try {
    dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (dnsErr) {
    console.warn("Could not configure custom DNS servers:", dnsErr.message);
}

require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = require("./src/app");
const connectToDB = require("./src/config/database");

const PORT = process.env.PORT || 5000;

connectToDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((err) => {
    console.error("Failed to connect to database:", err);
    process.exit(1);
});