import React from 'react';
import SalesReport from '../SalesReport';
import { Box, Typography } from '@mui/material';

const AdminReports = () => {
    return (
        <Box>
            <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>System Reports</Typography>
            <SalesReport />
        </Box>
    );
};

export default AdminReports;
