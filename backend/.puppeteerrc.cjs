const { join } = require("path");

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
    // Ensures Puppeteer finds the downloaded Chromium binary on Render Linux and local environments
    cacheDirectory: join(__dirname, ".cache", "puppeteer"),
};
