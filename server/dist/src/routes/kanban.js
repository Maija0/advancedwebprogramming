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
const Ticket_1 = require("../models/Ticket");
const kanbanRouter = (0, express_1.Router)();
kanbanRouter.use(express_1.default.json());
// Create a new board 
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
// Get specific user's boards
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
// Create a new column for a specific user
kanbanRouter.post("/columns", (0, express_validator_1.body)("name"), (0, express_validator_1.body)("boardId"), validateToken_1.validateToken, async (req, res) => {
    try {
        const { name, boardId } = req.body;
        const board = await Board_1.Board.findById(boardId);
        const newColumn = new Column_1.Column({ name, boardId });
        await newColumn.save();
        res.status(200).json({ message: "Created column:", newColumn });
    }
    catch (error) {
        console.log("Error when adding a column", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
// Rename column
kanbanRouter.put("/columns/:columnId", validateToken_1.validateToken, async (req, res) => {
    try {
        const { columnId } = req.params;
        const { name } = req.body;
        if (!name) {
            res.status(404).json({ message: "Column name needed" });
            return;
        }
        const column = await Column_1.Column.findById(columnId);
        if (!column) {
            res.status(404).json({ message: "Column not found" });
            return;
        }
        column.name = name;
        await column.save();
        res.status(200).json({ message: "Column renamed successfully", column });
    }
    catch (error) {
        console.log("Error renaming column", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
// Get columns with board ID
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
// Delete column with column ID
kanbanRouter.delete("/columns/:columnId", validateToken_1.validateToken, async (req, res) => {
    try {
        const { columnId } = req.params;
        const column = await Column_1.Column.findById(columnId);
        if (!column) {
            res.status(404).json({ message: "Column wasn't found" });
            return;
        }
        await Ticket_1.Ticket.deleteMany({ columnId });
        await column.deleteOne();
        res.status(200).json({ message: "Column deleted" });
    }
    catch (error) {
        console.log("Error deleting column", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
// Create ticket for a specific column
kanbanRouter.post("/tickets", (0, express_validator_1.body)("name"), (0, express_validator_1.body)("columnId"), validateToken_1.validateToken, async (req, res) => {
    try {
        const { name, columnId } = req.body;
        const column = await Column_1.Column.findById(columnId);
        const newTicket = new Ticket_1.Ticket({ name, columnId });
        await newTicket.save();
        res.status(200).json({ message: "Created ticket:", newTicket });
    }
    catch (error) {
        console.log("Error adding a ticket", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
// Get a ticket using column ID
kanbanRouter.get("/tickets/:columnId", validateToken_1.validateToken, async (req, res) => {
    try {
        const { columnId } = req.params;
        const column = await Column_1.Column.findById(columnId);
        if (!column) {
            res.status(404).json({ message: "Column wasn't found" });
            return;
        }
        const tickets = await Ticket_1.Ticket.find({ columnId });
        res.status(200).json({ tickets });
    }
    catch (error) {
        console.log("Error fetching tickets", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
// Delete ticket with ticket ID
kanbanRouter.delete("/tickets/:ticketId", validateToken_1.validateToken, async (req, res) => {
    try {
        const { ticketId } = req.params;
        const ticket = await Ticket_1.Ticket.findById(ticketId);
        if (!ticket) {
            res.status(404).json({ message: "Ticket wasn't found" });
            return;
        }
        await ticket.deleteOne();
        res.status(200).json({ message: "Ticket deleted" });
    }
    catch (error) {
        console.log("Error deleting ticket", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.default = kanbanRouter;
