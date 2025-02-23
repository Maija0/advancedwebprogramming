import mongoose, {Document, Schema} from "mongoose";

interface IBoard extends Document {
    name: string
    userId: Schema.Types.ObjectId
}

const BoardSchema: Schema = new Schema({
    name: {type: String, required: true},
    userId: {type: Schema.Types.ObjectId, ref: "User", required: true}
})

const Board: mongoose.Model<IBoard> = mongoose.model<IBoard>("Board", BoardSchema)

export {Board, IBoard}