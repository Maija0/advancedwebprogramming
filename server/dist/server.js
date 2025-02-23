"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const user_1 = __importDefault(require("./src/routes/user"));
const kanban_1 = __importDefault(require("./src/routes/kanban"));
const morgan_1 = __importDefault(require("morgan"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const port = 3000;
const app = (0, express_1.default)();
const mongoDB = "mongodb://localhost:27017/testdb";
mongoose_1.default.connect(mongoDB);
mongoose_1.default.Promise = Promise;
const db = mongoose_1.default.connection;
db.on("error", console.error.bind(console, "MongoDB connection error"));
const corsOptions = {
    origin: ['http://localhost:3001'],
    optionsSuccessStatus: 200,
};
app.use((0, cors_1.default)(corsOptions));
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, "../public")));
app.get("/", (reg, res) => {
    res.sendFile(path_1.default.join(__dirname, "../public/register.html"));
});
app.use("/api", user_1.default, kanban_1.default);
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
