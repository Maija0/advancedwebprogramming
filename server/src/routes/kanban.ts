import express, {Request, Response, Router} from "express"
import { body, Result, ValidationError, validationResult } from 'express-validator'
import { validateToken, CustomRequest } from '../middleware/validateToken'
import { Board } from "../models/Board";
import { Column } from "../models/Column";
import { Ticket } from "../models/Ticket";

const kanbanRouter: Router = Router()
kanbanRouter.use(express.json())

// create a new board 
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

// get users boards
kanbanRouter.get("/boards",validateToken, async (req: CustomRequest, res: Response) => { 
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


// create a new column
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
        console.log("Error when creating adding a column", error)
        res.status(500).json({error: "Internal Server Error"})
    }
})

export default kanbanRouter
