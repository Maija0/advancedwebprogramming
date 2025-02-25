import { useEffect, useState } from "react";
import {Link} from 'react-router-dom'

interface Board {
    _id: string;
    name: string;
}
const Home = () => {
    const [boards, setBoards] = useState<Board[]>([]);
    
    useEffect(() => {
    const fetchBoards = async () => {
        const token = localStorage.getItem("token")
        try {
            const response = await fetch("http://localhost:3000/api/boards",{
                method: "GET",
                headers: {"Authorization": `Bearer ${token}`, "Content-Type": "application/json"}
            })
            if (!response.ok) {
                throw new Error("Error fetching boards");
            }
            const data: Board[] = await response.json();
            setBoards(data);
            //const data: {name: string} [] = await response.json();
            //setBoards(data.map((board) => board.name));
        } catch (error) {
            console.log(`Error fetching boards, ${error.message}`);
        }
    }
    fetchBoards();
}, []);
return (
    <div>
        <h1>Boards here:</h1>
        <ul>
            {boards.map((board) => (
                <li key={board._id}>
                <Link to={`/Kanban/${board._id}`}>{board.name}</Link>
            </li>
            ))}
        </ul>
    </div>
    )
}

export default Home;