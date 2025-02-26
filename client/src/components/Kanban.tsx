import { useEffect, useState } from "react";
import {useParams} from 'react-router-dom'
import {Grid,Typography, Paper,TextField, Button,Box} from '@mui/material/';

interface Column {
    _id: string;
    name: string;
}

const Kanban = () => {
    const {boardId } = useParams<{boardId:string }>();
    const [columns, setColumns] = useState<Column[]>([]);
    const [newColumnName, setNewColumnName] = useState("");

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
    //useeffect that calls fetchColumns when boardId is updated
    useEffect(() => {
        fetchColumns();
    }, [boardId])

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
                throw new Error("Error creating clumn");
            }
            const newColumn: Column = await response.json();
            setColumns([...columns, newColumn]);
            fetchColumns();
            setNewColumnName("");
        } catch (error) {
            console.log(`Error creating board, ${error.message}`);
        }
    }
    
    return (
    <div>
    <Box sx={{display:"flex", margin:2}}>

        <TextField label="New column name" variant="outlined" value={newColumnName} onChange={(e) => setNewColumnName(e.target.value)}
        sx={{ margin:1}}
        />
        <Button onClick={createColumn}> Add a column </Button>
    </Box>
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
            <div style={{flexGrow: 1, overflowY: "auto", padding: 5}}>
            {column.tickets?.map((ticket) => (
            <Paper
                key={ticket._id}
                sx={{
                    padding:2,
                    border: '1px solid blue',
                    marginBottom: 1,
                    minHeight: 50,
                    maxHeight: 50,
                }}
                >
                    {/*Ticket title*/}    
                    <Typography sx={{fontSize:12}}>{ticket.name}</Typography>
            </Paper>
            ))}
            </div>
            </Paper>
            </Grid>
        ))}
        </Grid>
        </div>
    )
}

export default Kanban;