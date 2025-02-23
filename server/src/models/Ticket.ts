import mongoose, {Document, Schema} from "mongoose";

interface ITicket extends Document {
    name: string
    columnId: Schema.Types.ObjectId
}

const TicketSchema: Schema = new Schema({
    name: {type: String, required: true},
    columnId: {type: Schema.Types.ObjectId, ref: "Column", required: true}
})

const Ticket: mongoose.Model<ITicket> = mongoose.model<ITicket>("Ticket", TicketSchema)

export {Ticket, ITicket}