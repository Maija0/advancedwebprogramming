import { useState } from 'react';
import { Box, Button, TextField } from '@mui/material';
import { Link } from 'react-router-dom';

// Register function sends data to backend (email, password) and redirects to login when successful
const fetchData = async (email: string, password: string) => {
  try {
    const response = await fetch('http://localhost:3000/api/user/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      throw new Error('Error registering user');
    }
    const data = await response.json();
    console.log(data);

    if (response.status === 200) {
      window.location.href = '/login';
    }
  } catch (error) {
    console.log(`Error registering user, ${error.message}`);
  }
};

const Register = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  return (
    <div>
      <h2>Register</h2>
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
          Register
        </Button>
        <Button color="inherit" component={Link} to="/Login">
          Login
        </Button>
      </Box>
    </div>
  );
};

export default Register;
