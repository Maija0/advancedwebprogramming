import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, Typography, CardActionArea, Box, Button, TextField } from '@mui/material/';
import "../App.css"

interface Board {
  _id: string;
  name: string;
}

const Home = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [newBoardName, setNewBoardName] = useState('');

  useEffect(() => {
    // Get existing boards 
    const fetchBoards = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:3000/api/boards', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
          throw new Error('Error fetching boards');
        }
        const data: Board[] = await response.json();
        setBoards(data);
      } catch (error) {
        console.log(`Error fetching boards, ${error.message}`);
      }
    };
    fetchBoards();
  }, []);

  // Create new board 
  const createBoard = async () => {
    if (!newBoardName.trim()) {
      return;
    }
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:3000/api/boards', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newBoardName }),
      });
      if (!response.ok) {
        throw new Error('Error creating boards');
      }
      const newBoard: Board = await response.json();
      setBoards([...boards, newBoard]);
      setNewBoardName('');
    } catch (error) {
      console.log(`Error creating board, ${error.message}`);
    }
  };

  return (
    <div>
      <Box sx={{ display: 'flex',flexWrap: "wrap", justifyContent: "center" }}>
        <TextField
          label="Board name"
          variant="outlined"
          value={newBoardName}
          onChange={(e) => setNewBoardName(e.target.value)}
          sx={{margin: 2}}
        />
        <Button onClick={createBoard} variant="outlined" sx={{margin: 2, border: '1px solid pink', color:"black", fontFamily: "Comfortaa, sans-serif", textTransform: "none"}}> Add a board </Button>
      </Box>
      <Box sx={{ display: 'flex', margin: 2 }}>
        {boards.map((board) => (
          <Card sx={{ maxWidth: 345, minWidth: 100, margin: 1, border: '1px solid pink' }} key={board._id}>
            {' '}
            <CardActionArea component={Link} to={`/Kanban/${board._id}`}>
              <CardContent>
                <Typography gutterBottom variant="h6" component="div"
                  
                  >
                  {board.name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  This is a kanban board, click to open.
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card> 
        ))}
      </Box>
    </div>
  );
};

export default Home;
