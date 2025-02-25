import { useEffect, useState } from "react";
import {useParams} from 'react-router-dom'

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
                    throw new Error("Error fetching boards");
                }
                const data = await response.json();
                setColumns(data.columns);
            }catch (error) {
                console.log(`Error fetching boards, ${error.message}`);
            }
        }
        fetchColumns();
    }, [boardId])

    return ( // Use kanban board name down in title CHANGE
    <div>   
        <h1> Kanban Board</h1>
        <h2>Columns listed: </h2>
        <ul>
        {columns.map((column) => (
                <li key={column._id}>{column.name}
            </li>
            ))}  
        </ul>
    </div>   
    )
}

export default Kanban;