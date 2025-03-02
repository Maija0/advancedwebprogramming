import express, {Request, Response, Router} from "express"
import fs from "fs";
import path from "path";
import { compile } from "morgan"
import bcrypt from 'bcrypt'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { body, Result, ValidationError, validationResult } from 'express-validator'
import { validateToken } from '../middleware/validateToken'
import { User } from "../models/User";

const userRouter: Router = Router()
userRouter.use(express.json())

// Register user 
userRouter.post("/user/register", 
    body("email").isEmail(),
    body("password").isLength({min: 3}),
    async (req: Request, res: Response) => {
        const errors: Result<ValidationError> = validationResult(req)

        if(!errors.isEmpty()) {
            console.log(errors);
            res.status(400).json({errors: errors.array()})
            return
        }

    try {
        const existingEmail = await User.findOne({email: req.body.email});
        if (existingEmail) {
            res.status(403).json({email: "email already in use"})
            return
        }

        const salt: string = bcrypt.genSaltSync(10)
        const hash: string = await bcrypt.hashSync(req.body.password, salt)
        const newUser = new User({email: req.body.email, password:hash})
        await newUser.save();

        res.status(200).json({email: req.body.email, password: hash,message: "User registered successfully"})

    } catch (error: any) {
        console.log("Error when registering user", error)
        res.status(500).json({error: "Internal Server Error"})
    }
    }
)

// Login user 
userRouter.post("/user/login", 
    body("email").isEmail(),
    body("password").isLength({min: 3}),
    async (req: Request, res: Response) => {
        try {
            const user = await User.findOne({email: req.body.email})

            if(!user){
                res.status(401).json({message: "Login failed, user email not found"})
                return
            }
            if(bcrypt.compareSync(req.body.password, user.password)) {
                const jwtPayload: JwtPayload = {
                    email: user.email,
                    id: user._id.toString(),
                }
                const token: string = jwt.sign(jwtPayload, process.env.SECRET as string, { expiresIn: "1h"})

                res.status(200).json({success:true, token})
                return
            }
            res.status(401).json({message:"Login failed"})
            return

        } catch (error: any) {
            console.log("Error when logging in user", error)
            res.status(500).json({error: "Internal Server Error"})
        }
    }
)

// Private route  *Not used*
userRouter.get("/private", validateToken, async (req: Request, res: Response) => {
    res.status(200).json({message: "This is protected secure route!"})
    return
})

export default userRouter
