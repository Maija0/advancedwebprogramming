"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const validateToken_1 = require("../middleware/validateToken");
const User_1 = require("../models/User");
const userRouter = (0, express_1.Router)();
userRouter.use(express_1.default.json());
// Register user 
userRouter.post("/user/register", (0, express_validator_1.body)("email").isEmail(), (0, express_validator_1.body)("password").isLength({ min: 3 }), async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        res.status(400).json({ errors: errors.array() });
        return;
    }
    try {
        const existingEmail = await User_1.User.findOne({ email: req.body.email });
        if (existingEmail) {
            res.status(403).json({ email: "email already in use" });
            return;
        }
        const salt = bcrypt_1.default.genSaltSync(10);
        const hash = await bcrypt_1.default.hashSync(req.body.password, salt);
        const newUser = new User_1.User({ email: req.body.email, password: hash });
        await newUser.save();
        res.status(200).json({ email: req.body.email, password: hash, message: "User registered successfully" });
    }
    catch (error) {
        console.log("Error when registering user", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
// Login user 
userRouter.post("/user/login", (0, express_validator_1.body)("email").isEmail(), (0, express_validator_1.body)("password").isLength({ min: 3 }), async (req, res) => {
    try {
        const user = await User_1.User.findOne({ email: req.body.email });
        if (!user) {
            res.status(401).json({ message: "Login failed, user email not found" });
            return;
        }
        if (bcrypt_1.default.compareSync(req.body.password, user.password)) {
            const jwtPayload = {
                email: user.email,
                id: user._id.toString(),
            };
            const token = jsonwebtoken_1.default.sign(jwtPayload, process.env.SECRET, { expiresIn: "1h" });
            res.status(200).json({ success: true, token });
            return;
        }
        res.status(401).json({ message: "Login failed" });
        return;
    }
    catch (error) {
        console.log("Error when logging in user", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
// Private route  *Not used*
userRouter.get("/private", validateToken_1.validateToken, async (req, res) => {
    res.status(200).json({ message: "This is protected secure route!" });
    return;
});
exports.default = userRouter;
