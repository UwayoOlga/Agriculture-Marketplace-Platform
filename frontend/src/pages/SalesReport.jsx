import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  CircularProgress,
  Alert,
  Divider,
  Stack,
  Grid,
  Paper,
  Container
} from '@mui/material';
import { FileDownload as FileDownloadIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { useSnackbar } from 'notistack';

const formatRwf = (value) =>
  new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(Number(value) || 0);

const SalesReport = () => {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [salesMetrics, setSalesMetrics] = useState({
    totalSales: 0,
    productsSold: 0,
    totalQuantity: 0,
    averagePrice: 0,
    loadingMetrics: false,
    error: null
  });
  const [reportDateRange, setReportDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  // Initialize default date range (last 30 days)
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    const formatDate = (date) => date.toISOString().split('T')[0];
    
    setReportDateRange({
      startDate: formatDate(thirtyDaysAgo),
      endDate: formatDate(today)
    });
  }, []);

  const handleFetchSalesMetrics = async () => {
    if (!reportDateRange.startDate || !reportDateRange.endDate) {
      enqueueSnackbar('Please select both start and end dates', { variant: 'warning' });
      return;
    }

    setSalesMetrics(prev => ({ ...prev, loadingMetrics: true, error: null }));
    try {
      const params = new URLSearchParams({
        start_date: reportDateRange.startDate,
        end_date: reportDateRange.endDate
      });

      await api.get(`/farmer/sales-report/?${params}`);
      
      setSalesMetrics({
        totalSales: 0,
        productsSold: 0,
        totalQuantity: 0,
        averagePrice: 0,
        loadingMetrics: false,
        error: null
      });
      
      enqueueSnackbar('Sales metrics loaded successfully', { variant: 'success' });
    } catch (error) {
      console.error('Failed to fetch sales metrics:', error);
      setSalesMetrics(prev => ({
        ...prev,
        loadingMetrics: false,
        error: error.response?.data?.detail || 'Failed to load sales metrics'
      }));
      enqueueSnackbar('Failed to load sales metrics', { variant: 'error' });
    }
  };

  const handleDownloadPDF = async () => {
    if (!reportDateRange.startDate || !reportDateRange.endDate) {
      enqueueSnackbar('Please select both start and end dates', { variant: 'warning' });
      return;
    }

    setSalesMetrics(prev => ({ ...prev, loadingMetrics: true }));
    try {
      const params = new URLSearchParams({
        start_date: reportDateRange.startDate,
        end_date: reportDateRange.endDate
      });

      const response = await api.get(`/farmer/sales-report/?${params}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sales_report_${reportDateRange.startDate}_to_${reportDateRange.endDate}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      enqueueSnackbar('Sales report downloaded successfully', { variant: 'success' });
    } catch (error) {
      console.error('Failed to download PDF:', error);
      enqueueSnackbar('Failed to download sales report', { variant: 'error' });
    } finally {
      setSalesMetrics(prev => ({ ...prev, loadingMetrics: false }));
    }
  };

  const handleDateChange = (field, value) => {
    setReportDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (user?.user_type !== 'FARMER') {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">
          Only farmers can access sales reports. Please log in as a farmer.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          📊 Sales Report
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Generate and download your sales reports for any date range
        </Typography>
      </Box>

      <Paper sx={{ p: 4, mb: 4 }}>
        {/* Date Range Selection */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            Select Date Range
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                type="date"
                label="Start Date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={reportDateRange.startDate}
                onChange={(e) => handleDateChange('startDate', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                type="date"
                label="End Date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={reportDateRange.endDate}
                onChange={(e) => handleDateChange('endDate', e.target.value)}
              />
            </Grid>
          </Grid>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleFetchSalesMetrics}
              disabled={salesMetrics.loadingMetrics || !reportDateRange.startDate || !reportDateRange.endDate}
            >
              {salesMetrics.loadingMetrics ? <CircularProgress size={20} sx={{ mr: 1 }} /> : '📈 Fetch Metrics'}
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<FileDownloadIcon />}
              onClick={handleDownloadPDF}
              disabled={salesMetrics.loadingMetrics || !reportDateRange.startDate || !reportDateRange.endDate}
            >
              {salesMetrics.loadingMetrics ? 'Generating...' : 'Download PDF'}
            </Button>
          </Stack>
        </Box>

        {/* Error Alert */}
        {salesMetrics.error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {salesMetrics.error}
          </Alert>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Sales Metrics Cards */}
        <Box>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            📈 Sales Summary Metrics
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ backgroundColor: '#f0f7ff', borderLeft: '4px solid #1976d2' }}>
                <CardContent>
                  <Typography color="textSecondary" variant="caption" sx={{ fontWeight: 600 }}>
                    Total Sales
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 1, fontWeight: 700, color: '#1976d2' }}>
                    {formatRwf(salesMetrics.totalSales)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ backgroundColor: '#f0fdf4', borderLeft: '4px solid #16a34a' }}>
                <CardContent>
                  <Typography color="textSecondary" variant="caption" sx={{ fontWeight: 600 }}>
                    Products Sold
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 1, fontWeight: 700, color: '#16a34a' }}>
                    {salesMetrics.productsSold}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ backgroundColor: '#fef3c7', borderLeft: '4px solid #f59e0b' }}>
                <CardContent>
                  <Typography color="textSecondary" variant="caption" sx={{ fontWeight: 600 }}>
                    Total Quantity
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 1, fontWeight: 700, color: '#d97706' }}>
                    {salesMetrics.totalQuantity} units
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ backgroundColor: '#fce7f3', borderLeft: '4px solid #ec4899' }}>
                <CardContent>
                  <Typography color="textSecondary" variant="caption" sx={{ fontWeight: 600 }}>
                    Average Price
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 1, fontWeight: 700, color: '#be185d' }}>
                    {formatRwf(salesMetrics.averagePrice)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 3 }}>
          💡 Tip: Select a date range and click "Download PDF" to generate a detailed sales report with all transactions, quantities, and prices.
        </Typography>
      </Paper>
    </Container>
  );
};

export default SalesReport;
