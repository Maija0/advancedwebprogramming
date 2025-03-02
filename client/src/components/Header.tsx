import {Link, useNavigate} from 'react-router-dom'
import HomeIcon from '@mui/icons-material/Home';
import {Typography, Button, Toolbar, IconButton, AppBar } from '@mui/material/';


// App's header
const Header = () => {
    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem("authToken");
        sessionStorage.removeItem("authToken");
        navigate('/Login');
    }
    return (
        <AppBar position="static">
            <Toolbar sx={{backgroundColor:"#F256A3"}}>
            <Typography variant="h6" sx={{ textAlign: 'center', fontSize: 15,  }}> Web task manager application</Typography>
                <IconButton color="inherit" component={Link} to="/Home">
                    <HomeIcon/>
                </IconButton>
                <Button color="inherit" onClick={logout}>Logout</Button>
            </Toolbar>
        </AppBar>

    )
}

export default Header;