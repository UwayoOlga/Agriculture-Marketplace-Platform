import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Box,
    Chip,
    CircularProgress,
    Alert,
    Paper,
    // Adding missing components
    Stack,
    TextField,
    MenuItem,
    Button,
    InputAdornment,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
// Adding missing icons
import FilterListIcon from '@mui/icons-material/FilterList';
import TableViewIcon from '@mui/icons-material/TableView';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import apiClient from '../api/apiClient';

// Import images (using available assets to ensure they load)
// If specific images aren't found, we'll fall back to placeholders or these generic ones
import img1 from '../assets/images/1.jpg';
import img2 from '../assets/images/2.jpg';
import img3 from '../assets/images/3.jpg';
import img4 from '../assets/images/4.jpg';
import img5 from '../assets/images/5.jpg';
// img6 removed due to missing file
import img7 from '../assets/images/RWANDAN_Fresh_Passionfruit.jpg';
const MarketPrices = () => { 
    const marketData = [
        { id: 1, name_rw: 'Ibigori', name_en: 'Maize', market: 'Kimironko', date: '2024-12-14', farmgate: 380, wholesale: 450, retail: 700, province: 'Kigali City', district: 'Gasabo', image: img1, trend: 'UP' },
        { id: 2, name_rw: 'Ibirayi (Kinigi)', name_en: 'Irish Potatoes', market: 'Kinigi Market', date: '2024-12-14', farmgate: 450, wholesale: 600, retail: 780, province: 'Northern', district: 'Musanze', image: img2, trend: 'UP' },
        { id: 3, name_rw: 'Ibishyimbo', name_en: 'Red Beans', market: 'Rwamagana Market', date: '2024-12-14', farmgate: 900, wholesale: 1200, retail: 1400, province: 'Eastern', district: 'Rwamagana', image: img3, trend: 'STABLE' },
        { id: 4, name_rw: 'Umuceri', name_en: 'Rice', market: 'Nyabugogo', date: '2024-12-14', farmgate: 1100, wholesale: 1700, retail: 2200, province: 'Kigali City', district: 'Nyarugenge', image: img1, trend: 'UP' },
        { id: 5, name_rw: 'Inyanya', name_en: 'Tomatoes', market: 'Mulindi', date: '2024-12-12', farmgate: 500, wholesale: 800, retail: 1000, province: 'Kigali City', district: 'Gasabo', image: img4, trend: 'DOWN' },
        { id: 6, name_rw: 'Karoti', name_en: 'Carrots', market: 'Nyabihu Market', date: '2024-12-10', farmgate: 300, wholesale: 600, retail: 800, province: 'Western', district: 'Nyabihu', image: img5, trend: 'STABLE' },
        { id: 7, name_rw: 'Marakuja', name_en: 'Passion Fruit', market: 'Huye Market', date: '2024-12-12', farmgate: 1000, wholesale: 1500, retail: 2000, province: 'Southern', district: 'Huye', image: img7, trend: 'UP' },
        { id: 8, name_rw: 'Ibijumba', name_en: 'Sweet Potatoes', market: 'Muhanga Market', date: '2024-12-11', farmgate: 200, wholesale: 320, retail: 450, province: 'Southern', district: 'Muhanga', image: img2, trend: 'DOWN' },
        { id: 9, name_rw: 'Ubunyobwa', name_en: 'Groundnuts', market: 'Bugesera', date: '2024-12-13', farmgate: 1800, wholesale: 2200, retail: 2600, province: 'Eastern', district: 'Bugesera', image: img3, trend: 'UP' },
        { id: 10, name_rw: 'Igitoki', name_en: 'Bananas', market: 'Rubavu', date: '2024-12-14', farmgate: 250, wholesale: 400, retail: 550, province: 'Western', district: 'Rubavu', image: img1, trend: 'STABLE' },
    ];

    const [filteredData, setFilteredData] = useState(marketData);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMarket, setSelectedMarket] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');

    useEffect(() => {
        let result = marketData;
        if (searchTerm) {
            result = result.filter(item =>
                item.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.name_rw.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (selectedMarket) {
            result = result.filter(item => item.market === selectedMarket);
        }
        if (selectedProduct) {
            result = result.filter(item => item.name_en === selectedProduct);
        }
        setFilteredData(result);
    }, [searchTerm, selectedMarket, selectedProduct]);


    // Dark Theme Colors
    const darkBg = '#121212';
    const cardBg = '#1e1e1e';
    const textPrimary = '#ffffff';
    const textSecondary = '#b0b0b0';
    const accentGreen = '#2e7d32'; // Keeping the user's preferred green
    const borderOne = '#333';

    // Unique options for dropdowns
    const markets = [...new Set(marketData.map(item => item.market))];
    const products = [...new Set(marketData.map(item => item.name_en))];

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: darkBg, color: textPrimary, py: 4 }}>
            <Container maxWidth="xl">

                {/* 1. Filter Section */}
                <Typography variant="h6" gutterBottom color={textSecondary}>Filters</Typography>
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={3}>
                        <TextField
                            label="Start Date"
                            type="date"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            sx={{ bgcolor: cardBg, input: { color: textPrimary }, label: { color: textSecondary }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: borderOne } } }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <TextField
                            label="End Date"
                            type="date"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            sx={{ bgcolor: cardBg, input: { color: textPrimary }, label: { color: textSecondary }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: borderOne } } }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <TextField
                            select
                            label="Select Product"
                            fullWidth
                            value={selectedProduct}
                            onChange={(e) => setSelectedProduct(e.target.value)}
                            sx={{ bgcolor: cardBg, color: textPrimary, svg: { color: textPrimary }, label: { color: textSecondary }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: borderOne }, color: textPrimary } }}
                        >
                            <MenuItem value="">All Products</MenuItem>
                            {products.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <TextField
                            select
                            label="Select Market"
                            fullWidth
                            value={selectedMarket}
                            onChange={(e) => setSelectedMarket(e.target.value)}
                            sx={{ bgcolor: cardBg, color: textPrimary, svg: { color: textPrimary }, label: { color: textSecondary }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: borderOne }, color: textPrimary } }}
                        >
                            <MenuItem value="">All Markets</MenuItem>
                            {markets.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <Button variant="contained" fullWidth sx={{ height: '100%', bgcolor: accentGreen }}>
                            FILTER
                        </Button>
                    </Grid>
                </Grid>

                {/* 2. Data Header & Controls */}
                <Box>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>Data Entries</Typography>
                    <Typography variant="body2" color={textSecondary} gutterBottom>Market prices information</Typography>

                    <Paper sx={{ p: 2, bgcolor: cardBg, mb: 2, display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
                        <Stack direction="row" spacing={2}>
                            <Button startIcon={<FilterListIcon />} variant="outlined" color="inherit" onClick={() => { setSearchTerm(''); setSelectedMarket(''); setSelectedProduct(''); }}>
                                Clear
                            </Button>
                            <Button startIcon={<TableViewIcon />} variant="contained" sx={{ bgcolor: '#5c6bc0' }}>CSV</Button>
                            <Button startIcon={<PictureAsPdfIcon />} variant="contained" sx={{ bgcolor: '#ef5350' }}>PDF</Button>
                            <Button startIcon={<TableViewIcon />} variant="contained" sx={{ bgcolor: '#42a5f5' }}>Excel</Button>
                        </Stack>

                        <TextField
                            placeholder="Keyword Search"
                            size="small"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: textSecondary }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ bgcolor: '#2c2c2c', borderRadius: 1, input: { color: textPrimary }, '& fieldset': { border: 'none' }, minWidth: 250 }}
                        />
                    </Paper>
                </Box>

                {/* 3. Data Table */}
                <TableContainer component={Paper} sx={{ bgcolor: cardBg }}>
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow sx={{ '& th': { color: textSecondary, borderColor: borderOne, fontWeight: 'bold' } }}>
                                <TableCell>#</TableCell>
                                <TableCell>Product Name</TableCell>
                                <TableCell>Product Name En</TableCell>
                                <TableCell>Markets</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Farmgate Price</TableCell>
                                <TableCell>Wholesale Price</TableCell>
                                <TableCell>Retail Price</TableCell>
                                <TableCell>Province</TableCell>
                                <TableCell>District</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredData.map((row, index) => (
                                <TableRow
                                    key={row.id}
                                    sx={{ '& td': { color: textPrimary, borderColor: borderOne }, '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Box component="img" src={row.image} alt="" sx={{ width: 30, height: 30, borderRadius: 1, objectFit: 'cover' }} />
                                            {row.name_rw}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Box component="img" src={row.image} alt="" sx={{ width: 30, height: 30, borderRadius: 1, objectFit: 'cover' }} />
                                            {row.name_en}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Box component="img" src={row.image} alt="" sx={{ width: 30, height: 30, borderRadius: 1, objectFit: 'cover' }} />
                                            {row.market}
                                        </Box>
                                    </TableCell>
                                    <TableCell>{row.date}</TableCell>
                                    <TableCell>{row.farmgate}</TableCell>
                                    <TableCell>{row.wholesale}</TableCell>
                                    <TableCell>{row.retail}</TableCell>
                                    <TableCell>{row.province}</TableCell>
                                    <TableCell>{row.district}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Container>
        </Box>
    );
};

export default MarketPrices;
