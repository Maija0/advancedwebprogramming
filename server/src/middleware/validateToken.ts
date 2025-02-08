import {Request, Response, NextFunction} from "express"
import jwt, {JwtPayload} from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

interface CustomRequest extends Request {
    user?: JwtPayload
}

export const validateToken = (req: CustomRequest, res: Response, next: NextFunction) => {
    const auth = req.header('authorization')
    if(!auth) {
        res.status(401).json({message: "Access denied, missing auth header "})
        return
    }

    const token = auth.split(" ")[1]
    if(!token) {
        res.status(401).json({message: "Access denied, problems splitting auth"})
        return
    }

    try {
        const verified: JwtPayload = jwt.verify(token, process.env.SECRET as string) as JwtPayload
        req.user = verified
        next()
    } catch (error:any) {
        res.status(401).json({message: "Error verifying token"})
    }
}