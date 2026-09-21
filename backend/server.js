require("dotenv").config();

const dns = require("dns");

dns.setServers([
    "8.8.8.8",
    "8.8.4.4"
]);

const app = require("./src/app");

const connectToDB = require("./src/config/database");

connectToDB();

app.listen(3000, () => {

    console.log("Server is running on port 3000");

});