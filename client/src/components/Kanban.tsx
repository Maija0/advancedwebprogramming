import { useEffect, useState } from "react";
import {useParams} from 'react-router-dom'
import {Grid,Typography, Paper} from '@mui/material/';

interface Column {
    _id: string;
    name: string;
}

const Kanban = () => {
    const {boardId } = useParams<{boardId:string }>();
    const [columns, setColumns] = useState<Column[]>([]);
    useEffect(() => {
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
                const data = await response.json();
                setColumns(data.columns);
            }catch (error) {
                console.log(`Error fetching columns, ${error.message}`);
            }
        }
        fetchColumns();
    }, [boardId])

    return ( 
    <Grid container spacing={2}>
        {columns.map((column) => (
            <Grid item key={column._id}>
            <Paper 
            sx={{
                width:100,
                padding:2,
                display: 'flex',
                border: '1px solid blue',
                margin: 1
            }}
            >
            <Typography variant="h6" sx={{textAlign: 'center'}}>
            {column.name}
            </Typography>
            <div style={{flexGrow: 1, borderRadius:"10px"}}>
            {/*Modify for ticket space*/}
            </div>
            </Paper>
            </Grid>
        ))}
        </Grid>  
    )
}

export default Kanban;