import mongoose, {Document, Schema} from "mongoose";

interface IColumn extends Document {
    name: string
    boardId: Schema.Types.ObjectId
}

const ColumnSchema: Schema = new Schema({
    name: {type: String, required: true},
    boardId: {type: Schema.Types.ObjectId, ref: "Board", required: true}
})

const Column: mongoose.Model<IColumn> = mongoose.model<IColumn>("Column", ColumnSchema)

export {Column, IColumn}