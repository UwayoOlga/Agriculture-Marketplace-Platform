import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Alert, Paper, Container } from '@mui/material';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';

const RequestPasswordReset = () => {
    // ... (state remains same)
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: '', message: '' });
        setLoading(true);

        try {
            const response = await apiClient.post('/password-reset/request/', { email });
            setStatus({
                type: 'success',
                message: 'Check your email for token'
            });
            setEmail('');
        } catch (error) {
            // Even on error, we might show a generic message for security, 
            // but for UX we often show the error if it's validation related.
            setStatus({
                type: 'error',
                message: 'Something went wrong. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
                    <Typography component="h1" variant="h5" align="center" gutterBottom>
                        Reset Password
                    </Typography>
                    <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 3 }}>
                        Enter your email address and we'll send you a link to reset your password.
                    </Typography>

                    {status.message && (
                        <Alert severity={status.type} sx={{ mb: 2 }}>
                            {status.message}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={loading}
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </Button>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Link to="/login" variant="body2">
                                Back to Login
                            </Link>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default RequestPasswordReset;
