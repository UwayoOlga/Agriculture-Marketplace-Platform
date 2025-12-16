import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Construction as ConstructionIcon } from '@mui/icons-material';

const AdminPlaceholderPage = ({ title }) => {
    return (
        <Box sx={{ textAlign: 'center', py: 10 }}>
            <Paper sx={{ p: 5, display: 'inline-block', borderRadius: 4 }}>
                <ConstructionIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h4" gutterBottom>{title}</Typography>
                <Typography color="text.secondary">
                    This management module is currently under development.
                </Typography>
            </Paper>
        </Box>
    );
};

export default AdminPlaceholderPage;
