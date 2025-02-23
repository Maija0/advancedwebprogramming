import { useEffect, useState } from "react";

const Home = () => {
    const [boards, setBoards] = useState<string[]>([]);
    
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
            const data: {name: string} [] = await response.json();

            setBoards(data.map((board) => board.name));
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
            {boards.map((name, index) => (
                <li key={index}>{name}</li>
            ))}
        </ul>
    </div>
)
}

export default Home;