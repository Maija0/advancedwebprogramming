import { useEffect, useState } from "react";
import {Link} from 'react-router-dom'
import {Card, CardContent,Typography, CardActionArea} from '@mui/material/';

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
        {boards.map((board) => (            
    <Card sx={{maxWidth:345, margin: 3, border: '1px solid blue', }} key={board._id}>
        <CardActionArea component={Link} to={`/Kanban/${board._id}`}>
            <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                    {board.name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            This is a kanban board, click to open.
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
        ))}
    </div>
  );
}

export default Home;