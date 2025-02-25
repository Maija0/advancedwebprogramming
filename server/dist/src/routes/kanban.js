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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
const express_validator_1 = require("express-validator");
const validateToken_1 = require("../middleware/validateToken");
const Board_1 = require("../models/Board");
const Column_1 = require("../models/Column");
const kanbanRouter = (0, express_1.Router)();
kanbanRouter.use(express_1.default.json());
// create a new board 
kanbanRouter.post("/boards", validateToken_1.validateToken, async (req, res) => {
    try {
        console.log("User from token:", req.user);
        const { name } = req.body;
        const newBoard = new Board_1.Board({ name, userId: req.user?.id });
        await newBoard.save();
        res.status(200).json(newBoard);
    }
    catch (error) {
        console.log("Error when creating a new board", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
// get users boards
kanbanRouter.get("/boards", validateToken_1.validateToken, async (req, res) => {
    try {
        const boards = await Board_1.Board.find({ userId: req.user?.id });
        if (!boards) {
            res.status(404).json({ message: "No boards found" });
            return;
        }
        res.status(200).json(boards);
    }
    catch (error) {
        console.log("Error fetching boards", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
// create a new column
kanbanRouter.post("/columns", (0, express_validator_1.body)("name"), (0, express_validator_1.body)("boardId"), validateToken_1.validateToken, async (req, res) => {
    try {
        const { name, boardId } = req.body;
        const board = await Board_1.Board.findById(boardId);
        const newColumn = new Column_1.Column({ name, boardId });
        await newColumn.save();
        res.status(200).json({ message: "Created column:", newColumn });
    }
    catch (error) {
        console.log("Error when creating adding a column", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
//get columns with boardId
kanbanRouter.get("/columns/:boardId", validateToken_1.validateToken, async (req, res) => {
    try {
        const { boardId } = req.params;
        const board = await Board_1.Board.findById(boardId);
        if (!board) {
            res.status(404).json({ message: "Board wasn't found" });
            return;
        }
        const columns = await Column_1.Column.find({ boardId });
        res.status(200).json({ board, columns });
    }
    catch (error) {
        console.log("Error fetching boards", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.default = kanbanRouter;
