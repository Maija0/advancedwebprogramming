import {BrowserRouter, Route, Routes } from 'react-router-dom'
import Header from "./components/Header";
import Login from "./components/Login";
import Register from "./components/Register";

function App() {
  return (
    <BrowserRouter>
          <h1>Full stack app</h1>
          <Header /> 
          <Routes> 
          <Route path="/Login" element={<Login />} />
          <Route path="/Register" element={<Register />} />  
        </Routes>
      </BrowserRouter>
  )
}
export default App
