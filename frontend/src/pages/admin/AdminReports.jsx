import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Grid, Tab, Tabs,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    FormControl, InputLabel, Select, MenuItem, TextField, Button,
    Checkbox, FormControlLabel, CircularProgress, Alert, Card, CardContent
} from '@mui/material';
import analyticsAPI from '../../services/analytics';
import { Download as DownloadIcon } from '@mui/icons-material';

const AdminReports = () => {
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Data States
    const [salesData, setSalesData] = useState(null);
    const [userData, setUserData] = useState(null);
    const [productData, setProductData] = useState(null);
    const [customReport, setCustomReport] = useState(null);

    // Filters
    const [salesPeriod, setSalesPeriod] = useState('30d');
    const [customFilters, setCustomFilters] = useState({
        start_date: '',
        end_date: '',
        metrics: {
            revenue: false,
            users: false,
            products: false
        }
    });

    useEffect(() => {
        if (tabValue === 0) fetchSalesData();
        if (tabValue === 1) fetchUserData();
        if (tabValue === 2) fetchProductData();
    }, [tabValue, salesPeriod]);

    const fetchSalesData = async () => {
        setLoading(true);
        try {
            const data = await analyticsAPI.getSalesAnalytics(salesPeriod);
            setSalesData(data);
        } catch (err) {
            setError('Failed to load sales data');
        } finally {
            setLoading(false);
        }
    };

    const fetchUserData = async () => {
        setLoading(true);
        try {
            const data = await analyticsAPI.getUserAnalytics();
            setUserData(data);
        } catch (err) {
            setError('Failed to load user data');
        } finally {
            setLoading(false);
        }
    };

    const fetchProductData = async () => {
        setLoading(true);
        try {
            const data = await analyticsAPI.getProductAnalytics();
            setProductData(data);
        } catch (err) {
            setError('Failed to load product data');
        } finally {
            setLoading(false);
        }
    };

    const handleCustomReportGenerate = async () => {
        setLoading(true);
        try {
            const metrics = Object.keys(customFilters.metrics).filter(k => customFilters.metrics[k]);
            const data = await analyticsAPI.getCustomReport({
                start_date: customFilters.start_date,
                end_date: customFilters.end_date,
                metrics
            });
            setCustomReport(data);
        } catch (err) {
            setError('Failed to generate report');
        } finally {
            setLoading(false);
        }
    };

    const MetricCard = ({ title, value, subtext }) => (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Typography color="textSecondary" gutterBottom>{title}</Typography>
                <Typography variant="h4" component="div">
                    {typeof value === 'number' && title.toLowerCase().includes('revenue')
                        ? `RWF ${value.toLocaleString()}`
                        : value}
                </Typography>
                {subtext && <Typography variant="caption" color="textSecondary">{subtext}</Typography>}
            </CardContent>
        </Card>
    );

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom fontWeight={700}>Advanced Reports & Analytics</Typography>

            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
                <Tab label="Sales Performance" />
                <Tab label="User Activity" />
                <Tab label="Product Performance" />
                <Tab label="Custom Report Builder" />
            </Tabs>

            {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>}
            {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}

            {/* SALES TAB */}
            {tabValue === 0 && salesData && (
                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                        <FormControl size="small" sx={{ width: 150 }}>
                            <InputLabel>Period</InputLabel>
                            <Select value={salesPeriod} label="Period" onChange={(e) => setSalesPeriod(e.target.value)}>
                                <MenuItem value="7d">Last 7 Days</MenuItem>
                                <MenuItem value="30d">Last 30 Days</MenuItem>
                                <MenuItem value="12m">Last 12 Months</MenuItem>
                                <MenuItem value="all">All Time</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} md={4}>
                            <MetricCard title="Total Revenue" value={salesData.summary.total_revenue} />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <MetricCard title="Total Orders" value={salesData.summary.total_orders} />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <MetricCard title="Avg Order Value" value={Math.round(salesData.summary.avg_order_value)} />
                        </Grid>
                    </Grid>

                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>Sales Data Breakdown</Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date</TableCell>
                                        <TableCell align="right">Orders</TableCell>
                                        <TableCell align="right">Revenue</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {salesData.chart_data.map((row, index) => (
                                        <TableRow key={index} hover>
                                            <TableCell>{row.date}</TableCell>
                                            <TableCell align="right">{row.orders}</TableCell>
                                            <TableCell align="right">RWF {row.revenue.toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))}
                                    {salesData.chart_data.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={3} align="center">No data for this period</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Box>
            )}

            {/* USERS TAB */}
            {tabValue === 1 && userData && (
                <Box>
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} md={3}>
                            <MetricCard title="Total Users" value={userData.stats.total} />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <MetricCard title="Active Users" value={userData.stats.active} />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <MetricCard title="Farmers" value={userData.stats.farmers} />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <MetricCard title="Buyers" value={userData.stats.buyers} />
                        </Grid>
                    </Grid>

                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>Registration History</Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Month</TableCell>
                                        <TableCell align="right">New Users</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {userData.growth_chart.map((row, index) => (
                                        <TableRow key={index} hover>
                                            <TableCell>{row.date}</TableCell>
                                            <TableCell align="right">{row.users}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Box>
            )}

            {/* PRODUCTS TAB */}
            {tabValue === 2 && productData && (
                <Box>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={7}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="h6" gutterBottom>Top Performing Products (Revenue)</Typography>
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Product</TableCell>
                                                <TableCell>Farmer</TableCell>
                                                <TableCell align="right">Sold</TableCell>
                                                <TableCell align="right">Revenue</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {productData.top_products.map((p, i) => (
                                                <TableRow key={i}>
                                                    <TableCell>{p.name}</TableCell>
                                                    <TableCell>{p.farmer}</TableCell>
                                                    <TableCell align="right">{p.sold}</TableCell>
                                                    <TableCell align="right">RWF {p.revenue?.toLocaleString()}</TableCell>
                                                </TableRow>
                                            ))}
                                            {productData.top_products.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={4} align="center">No sales data found</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={5}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="h6" gutterBottom color="error">Low Stock Alerts</Typography>
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Product</TableCell>
                                                <TableCell align="right">Stock</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {productData.low_stock.map((p, i) => (
                                                <TableRow key={i}>
                                                    <TableCell>{p.name} ({p.farmer__username})</TableCell>
                                                    <TableCell align="right" sx={{ color: 'error.main', fontWeight: 'bold' }}>{p.stock}</TableCell>
                                                </TableRow>
                                            ))}
                                            {productData.low_stock.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={2} align="center">No low stock items</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            )}

            {/* CUSTOM TAB */}
            {tabValue === 3 && (
                <Box>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>Build Custom Report</Typography>
                        <Grid container spacing={3} alignItems="flex-end">
                            <Grid item xs={12} md={3}>
                                <TextField
                                    label="Start Date"
                                    type="date"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    value={customFilters.start_date}
                                    onChange={(e) => setCustomFilters({ ...customFilters, start_date: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <TextField
                                    label="End Date"
                                    type="date"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    value={customFilters.end_date}
                                    onChange={(e) => setCustomFilters({ ...customFilters, end_date: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="caption" display="block">Select Metrics</Typography>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <FormControlLabel
                                        control={<Checkbox checked={customFilters.metrics.revenue} onChange={(e) => setCustomFilters({ ...customFilters, metrics: { ...customFilters.metrics, revenue: e.target.checked } })} />}
                                        label="Revenue"
                                    />
                                    <FormControlLabel
                                        control={<Checkbox checked={customFilters.metrics.users} onChange={(e) => setCustomFilters({ ...customFilters, metrics: { ...customFilters.metrics, users: e.target.checked } })} />}
                                        label="New Users"
                                    />
                                    <FormControlLabel
                                        control={<Checkbox checked={customFilters.metrics.products} onChange={(e) => setCustomFilters({ ...customFilters, metrics: { ...customFilters.metrics, products: e.target.checked } })} />}
                                        label="New Products"
                                    />
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    onClick={handleCustomReportGenerate}
                                    disabled={loading}
                                    startIcon={<DownloadIcon />}
                                >
                                    Generate
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>

                    {customReport && (
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>Report Results</Typography>
                            <Grid container spacing={3}>
                                {customReport.sales && (
                                    <Grid item xs={12} md={4}>
                                        <MetricCard title="Revenue" value={customReport.sales.total || 0} subtext={`${customReport.sales.count} Orders`} />
                                    </Grid>
                                )}
                                {customReport.new_users !== undefined && (
                                    <Grid item xs={12} md={4}>
                                        <MetricCard title="New Users Joined" value={customReport.new_users} />
                                    </Grid>
                                )}
                                {customReport.new_products !== undefined && (
                                    <Grid item xs={12} md={4}>
                                        <MetricCard title="New Products Listed" value={customReport.new_products} />
                                    </Grid>
                                )}
                            </Grid>
                        </Paper>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default AdminReports;
