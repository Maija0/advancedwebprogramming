import { useEffect, useState } from "react";
import {useParams} from 'react-router-dom'
import {Grid,Typography, Paper,TextField, Button,Box} from '@mui/material/';
import {DragDropContext, Droppable, Draggable} from "react-beautiful-dnd"

interface Column {
    _id: string;
    name: string;
    tickets: {_id: string; name: string} [];
}

const Kanban = () => {
    const {boardId } = useParams<{boardId:string }>();
    const [columns, setColumns] = useState<Column[]>([]);
    const [newColumnName, setNewColumnName] = useState("");
    const [newTicketName, setNewTicketName] =  useState<{ [key: string]: string }>({});

    // Fetch columns & tickets
    const fetchColumns = async() =>{
        const token = localStorage.getItem("token");
        try{
            const response = await fetch(`http://localhost:3000/api/columns/${boardId}`, {
                method: "GET",
                headers: {"Authorization": `Bearer ${token}`, "Content-type": "application/json" }
            })
            if (!response.ok) {
                throw new Error("Error fetching columns");
            }
            const columnData = await response.json();
            const columnsList = columnData.columns;
            const columnsWithTickets = await Promise.all(
                columnsList.map(async(column: Column) =>  {
                    const ticketResponse = await fetch(`http://localhost:3000/api/tickets/${column._id}`, {
                        method: "GET",
                        headers: {"Authorization": `Bearer ${token}`, "Content-type": "application/json" }
                })
                if (!ticketResponse.ok) {
                    throw new Error("Error fetching tickets");
                }
            const ticketData = await ticketResponse.json();
            const ticketsList = ticketData.tickets;

            return {...column, tickets:ticketsList};
            })
        )
            setColumns(columnsWithTickets);
        } catch (error) {
            console.log(`Error fetching columns, ${error.message}`);
        }
    }
    // useEffect that calls fetchColumns when boardId is updated
    useEffect(() => {
        fetchColumns();
    }, [boardId])

    // Create a new column
    const createColumn = async () => {
        if (!newColumnName.trim()){
            return;
        }
        const token = localStorage.getItem("token")
        try {
            const response = await fetch("http://localhost:3000/api/columns",{
                method: "POST",
                headers: {"Authorization": `Bearer ${token}`, "Content-Type": "application/json"},
                body: JSON.stringify({name: newColumnName, boardId: boardId})
            })
            if (!response.ok) {
                throw new Error("Error creating column");
            }
            const newColumn: Column = await response.json();
            setColumns([...columns, newColumn]);
            fetchColumns();
            setNewColumnName("");
        } catch (error) {
            console.log(`Error creating column, ${error.message}`);
        }
    }
    
    // Create a new ticket
    const createTicket = async (columnId: string) => {
        const token = localStorage.getItem("token")
        try {
            const response = await fetch("http://localhost:3000/api/tickets",{
                method: "POST",
                headers: {"Authorization": `Bearer ${token}`, "Content-Type": "application/json"},
                body: JSON.stringify({name: newTicketName[columnId], columnId})
            })
            if (!response.ok) {
                throw new Error("Error creating ticket");
            }
            const newTicket = await response.json();
            // add new ticket to the right column in the state
            setColumns((prevColumns) => prevColumns.map((column) => column._id === columnId 
            ? { ...column, tickets: [...(column.tickets), newTicket.newTicket] } : column
        ));

        setNewTicketName("");
        } catch (error) {
            console.log(`Error creating ticket, ${error.message}`);
        }
    }
    // Delete ticket
    const deleteTicket = async (ticketId: string, columnId:string) => {
        const token = localStorage.getItem("token")
        try {
            const response = await fetch(`http://localhost:3000/api/tickets/${ticketId}`,{
                method: "DELETE",
                headers: {"Authorization": `Bearer ${token}`, "Content-Type": "application/json"},
            })
            if (!response.ok) {
                throw new Error("Error deleting ticket");
            }
            setColumns((prevColumns) => prevColumns.map((column) => column._id === columnId 
            ? { ...column, tickets: column.tickets.filter((ticket) => ticket._Id !== ticketId)} : column
            ));

        } catch (error) {
            console.log(`Error deleting ticket, ${error.message}`);
        }
    }

    //TicketNameChange is called when input field is changed
    //It updates the newTicketName state with the tickets name for a specific column
    const TicketNameChange = (columnId: string, name: string) => {
        setNewTicketName((prev) => ({ ...prev, [columnId]: name }));
      };

    // Delete column
    const deleteColumn = async (columnId: string) => {
        const token = localStorage.getItem("token")
        try {
            const response = await fetch(`http://localhost:3000/api/columns/${columnId}`,{
                method: "DELETE",
                headers: {"Authorization": `Bearer ${token}`, "Content-Type": "application/json"},
            })
            if (!response.ok) {
                throw new Error("Error deleting column");
            }
            setColumns((prevColumns) => prevColumns.filter((column) => column._id !== columnId))
        } catch (error) {
            console.log(`Error deleting column, ${error.message}`);
        }
    }
    
const handleDragnAndDrop = (results) => {
    // dragged tickets source, destination and id
    const {source, destination, draggableId} = results;

    //error handling for non valid destination and same location
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index=== destination.index) return;
    
    // Find index for destination and source columns and theyre objects
    const destinationColumnIndex = columns.findIndex((column) => column._id === destination.droppableId)
    const sourceColumnIndex = columns.findIndex((column) => column._id === source.droppableId)
    const destinationColumn = columns[destinationColumnIndex];
    const sourceColumn = columns[sourceColumnIndex];
    
    // Dragged ticket found using id
    const draggedTicket = sourceColumn.tickets.find((ticket) => ticket._id === draggableId)
    const newSourceTickets = sourceColumn.tickets;
    newSourceTickets.splice(source.index, 1)

    const newDestinationTicket = destinationColumn.tickets;
    newDestinationTicket.splice(destination.index, 0, draggedTicket) //

    const newColumns = [...columns]
    newColumns[sourceColumnIndex] = {...sourceColumn, tickets: newSourceTickets};
    newColumns[destinationColumnIndex] = {...destinationColumn, tickets: newDestinationTicket}

    setColumns(newColumns)
}

    return (
    <div>
        <Box sx={{display:"flex", margin:2}}>
            <TextField label="New column name" variant="outlined" value={newColumnName} onChange={(e) => setNewColumnName(e.target.value)}
            sx={{ margin:1}}/>
            <Button onClick={createColumn}> Add a column </Button>
        </Box>
        <DragDropContext onDragEnd={handleDragnAndDrop}>
            <Grid container spacing={2}>
                {columns.map((column) => (
                    <Grid item key={column._id}>
                        <Paper 
                        sx={{
                            width:100,
                            padding:2,
                            display: 'flex',
                            border: '1px solid blue',
                            margin: 1,
                            flexDirection: "column"
                        }}
                    >
            <Typography variant="h6" sx={{textAlign: 'center', fontSize: 15,}}>
                {column.name}
            </Typography>
            <Button onClick={() => deleteColumn(column._id)}> Delete Column </Button>
            <Droppable droppableId={column._id}> 
                {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}
                    style={{flexGrow: 1, overflowY: "auto", padding: 5}}
                >
            {(column.tickets || []).map((ticket, index) => (
                <Draggable key= {ticket._id} draggableId={ticket._id} index={index}>
                    {(provided) => (
                        <Paper
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            key={ticket._id}
                            sx={{
                                padding:2,
                                border: '1px solid blue',
                                marginBottom: 1,
                                minHeight: 50,
                                maxHeight: 50,
                            }}
                            >
                            <Typography sx={{fontSize:12}}>{ticket.name}</Typography>
                            <Button onClick={() => deleteTicket(ticket._id, column._id)}> Delete Ticket </Button>
                        </Paper>
                    )}
                </Draggable>
            ))}
            {provided.placeholder}
        </div>
            )}
            </Droppable>
            <TextField label="new ticket" variant="outlined" value={newTicketName[column._id]|| ""} onChange={(e) => TicketNameChange(column._id, e.target.value)}
                sx={{ margin:1}}
            />
            <Button onClick={() => createTicket(column._id)}> Add a ticket </Button>
        </Paper>
        </Grid>
        ))}
        </Grid>
        </DragDropContext>
    </div>
    )
}

export default Kanban;
