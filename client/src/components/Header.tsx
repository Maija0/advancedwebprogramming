import {Link} from 'react-router-dom'
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';

const Header = () => {

    return (
        <AppBar position="absolute"
        sx={{width: "100%"}}
        >
            <Toolbar>
                <Button color="inherit" component={Link} to="/">Home</Button>
                <Button color="inherit" component={Link} to="/Login">Logout</Button>
            </Toolbar>
        </AppBar>

    )
}

export default Header;