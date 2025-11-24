import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Container, Paper, Typography, TextField, Button, Box, Alert } from '@mui/material';

const Profile = () => {
  const { user, updateProfile, isAuthenticated } = useAuth();
  const [form, setForm] = useState({});
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        address: user.address || '',
      });
    }
  }, [user]);

  if (!isAuthenticated) return null;

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    try {
      const res = await updateProfile(form);
      if (res.success) setStatus({ type: 'success', message: 'Profile updated' });
      else setStatus({ type: 'error', message: res.error || 'Update failed' });
    } catch (err) {
      setStatus({ type: 'error', message: 'Unexpected error' });
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 6 }}>
        <Paper sx={{ p: 4 }} elevation={3}>
          <Typography variant="h5" gutterBottom>My Profile</Typography>
          {status && <Alert severity={status.type} sx={{ mb: 2 }}>{status.message}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField fullWidth label="First name" name="first_name" value={form.first_name || ''} onChange={handleChange} sx={{ mb: 2 }} />
            <TextField fullWidth label="Last name" name="last_name" value={form.last_name || ''} onChange={handleChange} sx={{ mb: 2 }} />
            <TextField fullWidth label="Email" name="email" value={form.email || ''} onChange={handleChange} sx={{ mb: 2 }} />
            <TextField fullWidth label="Phone" name="phone_number" value={form.phone_number || ''} onChange={handleChange} sx={{ mb: 2 }} />
            <TextField fullWidth label="Address" name="address" value={form.address || ''} onChange={handleChange} multiline rows={2} sx={{ mb: 2 }} />

            <Button type="submit" variant="contained">Save changes</Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Profile;
