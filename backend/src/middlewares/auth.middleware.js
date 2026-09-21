const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/blacklist.model");

async function authUser(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            message: "Authentication token is required!",
        });
    }

    const isTokenBlacklisted = await tokenBlacklistModel.findOne({
        token,
    });

    if (isTokenBlacklisted) {
        return res.status(401).json({
            message: "Authentication token has been invalidated!",
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            message: "Invalid or expired authentication token!",
        });
    }
}

module.exports = { authUser };
