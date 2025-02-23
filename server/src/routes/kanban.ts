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

export default kanbanRouter
