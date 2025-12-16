import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Alert, Paper, Container } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../../api/apiClient';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!token) {
            setStatus({ type: 'error', message: 'Invalid or missing reset token.' });
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: '', message: '' });

        if (passwords.newPassword !== passwords.confirmPassword) {
            setStatus({ type: 'error', message: 'Passwords do not match.' });
            return;
        }

        if (passwords.newPassword.length < 8) {
            setStatus({ type: 'error', message: 'Password must be at least 8 characters.' });
            return;
        }

        setLoading(true);

        try {
            await apiClient.post('/password-reset/confirm/', {
                token: token,
                new_password: passwords.newPassword
            });
            setStatus({ type: 'success', message: 'Password has been reset successfully! Redirecting to login...' });
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (error) {
            const errorMsg = error.response?.data?.detail || 'Failed to reset password. Link may be expired.';
            setStatus({ type: 'error', message: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
                    <Typography component="h1" variant="h5" align="center" gutterBottom>
                        Set New Password
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
                            name="newPassword"
                            label="New Password"
                            type="password"
                            id="newPassword"
                            value={passwords.newPassword}
                            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                            disabled={!token}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="confirmPassword"
                            label="Confirm New Password"
                            type="password"
                            id="confirmPassword"
                            value={passwords.confirmPassword}
                            onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                            disabled={!token}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={loading || !token}
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default ResetPassword;
