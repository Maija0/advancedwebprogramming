import express, {Request, Response, Router} from "express"
import { body, Result, ValidationError, validationResult } from 'express-validator'
import { validateToken, CustomRequest } from '../middleware/validateToken'
import { Board } from "../models/Board";
import { Column } from "../models/Column";
import { Ticket } from "../models/Ticket";

const kanbanRouter: Router = Router()
kanbanRouter.use(express.json())

// Create a new board 
kanbanRouter.post("/boards",validateToken, async (req: CustomRequest, res: Response) => { 
    try {
        console.log("User from token:", req.user);
        const {name} = req.body;
        const newBoard = new Board({name, userId: req.user?.id});
        await newBoard.save();
        res.status(200).json(newBoard);
    } catch (error: any) {
        console.log("Error when creating a new board", error)
        res.status(500).json({error: "Internal Server Error"})
    }
})

// Get specific user's boards
kanbanRouter.get("/boards", validateToken, async (req: CustomRequest, res: Response) => { 
    try {
        const boards = await Board.find({userId: req.user?.id})
        if (!boards){
            res.status(404).json({message: "No boards found"});
            return
        }

        res.status(200).json(boards);
    } catch (error: any) {
        console.log("Error fetching boards", error)
        res.status(500).json({error: "Internal Server Error"})
    }
})


// Create a new column for a specific user
kanbanRouter.post("/columns",
    body("name"),
    body("boardId"),
    validateToken, async (req: Request, res: Response) => { 
    try {
        const {name, boardId} = req.body;
        const board = await Board.findById(boardId);
        const newColumn = new Column({name, boardId})
        await newColumn.save()
        res.status(200).json({message: "Created column:", newColumn});
    } catch (error: any) {
        console.log("Error when adding a column", error)
        res.status(500).json({error: "Internal Server Error"})
    }
})

// Rename column
kanbanRouter.put("/columns/:columnId", validateToken, async (req: CustomRequest, res: Response) => { 
    try {
        const {columnId} = req.params;
        const {name} = req.body;
        if (!name) {
            res.status(400).json({message: "Column name needed"});
            return
        }

        const column = await Column.findById(columnId);
        if (!column) {
            res.status(404).json({message: "Column not found"});
            return
        }
        column.name = name;
        await column.save()
        res.status(200).json({message: "Column renamed successfully", column});
    } catch (error: any) {
        console.log("Error renaming column", error)
        res.status(500).json({error: "Internal Server Error"})
    }
})

// Get columns with board ID
kanbanRouter.get("/columns/:boardId",validateToken, async (req: CustomRequest, res: Response) => { 
    try {
        const {boardId} = req.params;

        const board = await Board.findById(boardId);
        if (!board){
            res.status(404).json({message: "Board wasn't found"});
            return
        }
        const columns = await Column.find({boardId})

        res.status(200).json({board, columns});
    } catch (error: any) {
        console.log("Error fetching boards", error)
        res.status(500).json({error: "Internal Server Error"})
    }
})

// Delete column with column ID
kanbanRouter.delete("/columns/:columnId", validateToken, async (req: CustomRequest, res: Response) => { 
    try {
        const {columnId} = req.params;

        const column = await Column.findById(columnId);
        if (!column){
            res.status(404).json({message: "Column not found"});
            return
        }
        await Ticket.deleteMany({columnId});
        await column.deleteOne()

        res.status(200).json({message: "Column deleted"});
    } catch (error: any) {
        console.log("Error deleting column", error)
        res.status(500).json({error: "Internal Server Error"})
    }
})

// Create ticket for a specific column
kanbanRouter.post("/tickets",
    body("name"),
    body("columnId"),
    validateToken, async (req: Request, res: Response) => { 
    try {
        const {name, columnId} = req.body;
        const column = await Column.findById(columnId);
        const newTicket = new Ticket({name, columnId})
       await newTicket.save()
        res.status(200).json({message: "Created ticket:", newTicket});
    } catch (error: any) {
        console.log("Error adding a ticket", error)
        res.status(500).json({error: "Internal Server Error"})
    }
})


// Get a ticket using column ID
kanbanRouter.get("/tickets/:columnId",validateToken, async (req: CustomRequest, res: Response) => { 
    try {
        const {columnId} = req.params;

        const column = await Column.findById(columnId);
        if (!column){
            res.status(404).json({message: "Column wasn't found"});
            return
        }
        const tickets = await Ticket.find({columnId})

        res.status(200).json({tickets});
    } catch (error: any) {
        console.log("Error fetching tickets", error)
        res.status(500).json({error: "Internal Server Error"})
    }
})

// Delete ticket with ticket ID
kanbanRouter.delete("/tickets/:ticketId", validateToken, async (req: CustomRequest, res: Response) => { 
    try {
        const {ticketId} = req.params;

        const ticket = await Ticket.findById(ticketId);
        if (!ticket){
            res.status(404).json({message: "Ticket wasn't found"});
            return
        }
        await ticket.deleteOne()
        res.status(200).json({message: "Ticket deleted"});
    } catch (error: any) {
        console.log("Error deleting ticket", error)
        res.status(500).json({error: "Internal Server Error"})
    }
})


export default kanbanRouter
