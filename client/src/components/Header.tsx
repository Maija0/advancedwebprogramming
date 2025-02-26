import {Link} from 'react-router-dom'
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import HomeIcon from '@mui/icons-material/Home';
import IconButton from '@mui/material/IconButton';

const Header = () => {

    return (
        <AppBar position="static">
            <Toolbar>
                <IconButton color="inherit" component={Link} to="/">
                    <HomeIcon/>
                </IconButton>
                <Button color="inherit" component={Link} to="/Login">Logout</Button>
            </Toolbar>
        </AppBar>

    )
}

export default Header;