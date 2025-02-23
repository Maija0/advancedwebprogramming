"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const validateToken = (req, res, next) => {
    const auth = req.header('authorization');
    if (!auth) {
        res.status(401).json({ message: "Access denied, missing auth header " });
        return;
    }
    const token = auth.split(" ")[1];
    if (!token) {
        res.status(401).json({ message: "Access denied, problems splitting auth" });
        return;
    }
    try {
        const verified = jsonwebtoken_1.default.verify(token, process.env.SECRET);
        req.user = verified;
        next();
    }
    catch (error) {
        res.status(401).json({ message: "Error verifying token", error });
    }
};
exports.validateToken = validateToken;
