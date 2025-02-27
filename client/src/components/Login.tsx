import { useState } from 'react';
import { Box, Button, TextField } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const navigate = useNavigate();

  const fetchData = async (email: string, password: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        throw new Error('Error logging in');
      }
      const data = await response.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        navigate('/Home');
      }
    } catch (error) {
      console.log(`Error logging in user, ${error.message}`);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <Box
        component="form"
        sx={{
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'column',
          '& .MuiTextField-root': { m: 1, width: '25ch' },
        }}
        noValidate
        autoComplete="off"
      >
        <TextField
          required
          id="outlined-required"
          label="Email"
          defaultValue=""
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          required
          id="outlined-password-input"
          label="Password"
          type="password"
          autoComplete="current-password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          onClick={() => fetchData(email, password)}
          variant="contained"
          sx={{ width: '15ch', m: 1 }}
          color="primary"
        >
          Login
        </Button>
        <Button color="inherit" component={Link} to="/Register">
          Register
        </Button>
      </Box>
    </div>
  );
};

export default Login;
