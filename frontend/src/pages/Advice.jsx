import { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Grid,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Card,
    CardContent,
    CardHeader,
    CardMedia,
    Chip,
    Alert,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack,
    CircularProgress,
    TextField,
    InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import apiClient from '../api/apiClient';
import rabLogo from '../assets/images/RAB_Logo.png';

const DISTRICTS = [
    'Gasabo', 'Kicukiro', 'Nyarugenge', 'Kamonyi', 'Muhanga', 'Ruhango', 'Nyanza', 'Huye',
    'Gisagara', 'Nyamagabe', 'Nyaruguru', 'Rusizi', 'Nyamasheke', 'Karongi', 'Rutsiro',
    'Rubavu', 'Nyabihu', 'Ngororero', 'Musanze', 'Burera', 'Gakenke', 'Gicumbi',
    'Rwamagana', 'Nyagatare', 'Gatsibo', 'Kayonza', 'Kirehe', 'Ngoma', 'Bugesera'
];

const SEASONS = [
    { value: 'ALL', label: 'All Seasons' },
    { value: 'RAINY_A', label: 'Rainy Season A (Sept-Jan)' },
    { value: 'RAINY_B', label: 'Rainy Season B (Feb-June)' },
    { value: 'DRY_C', label: 'Dry Season C (July-Aug)' },
];

const AdviceCard = ({ advice }) => {
    const [openSafety, setOpenSafety] = useState(false);

    const isHighRisk = advice.risk_level === 'HIGH';
    const isMediumRisk = advice.risk_level === 'MEDIUM';

    const getRiskColor = (level) => {
        switch (level) {
            case 'HIGH': return 'error';
            case 'MEDIUM': return 'warning';
            default: return 'success';
        }
    };

    return (
        <>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', border: isHighRisk ? '1px solid red' : 'none' }}>
                {advice.image && (
                    <CardMedia
                        component="img"
                        height="140"
                        image={advice.image}
                        alt={advice.title}
                        sx={{ filter: isHighRisk ? 'blur(4px)' : 'none', transition: 'filter 0.3s' }}
                    />
                )}
                <CardContent sx={{ flexGrow: 1, filter: isHighRisk ? 'blur(3px)' : 'none' }}>
                    <Stack direction="row" spacing={1} mb={1}>
                        <Chip
                            label={advice.risk_level}
                            color={getRiskColor(advice.risk_level)}
                            size="small"
                            icon={isHighRisk ? <WarningAmberIcon /> : <VerifiedUserIcon />}
                        />
                        {advice.category && <Chip label={advice.category} size="small" variant="outlined" />}
                    </Stack>
                    <Typography variant="h6" gutterBottom>{advice.title}</Typography>

                    <Stack direction="row" spacing={2} sx={{ mb: 2, color: 'text.secondary', fontSize: '0.875rem' }}>
                        {advice.district && (
                            <Box display="flex" alignItems="center" gap={0.5}>
                                <LocationOnIcon fontSize="small" /> {advice.district}
                            </Box>
                        )}
                        {advice.season && advice.season !== 'ALL' && (
                            <Box display="flex" alignItems="center" gap={0.5}>
                                <CalendarMonthIcon fontSize="small" /> {advice.season.replace('_', ' ')}
                            </Box>
                        )}
                    </Stack>

                    <Typography variant="body2" color="text.secondary" sx={{
                        display: '-webkit-box',
                        overflow: 'hidden',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 3,
                    }}>
                        {advice.content}
                    </Typography>
                </CardContent>

                {isHighRisk && (
                    <Box sx={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                        backgroundColor: 'rgba(255,255,255,0.6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1
                    }}>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => setOpenSafety(true)}
                            startIcon={<WarningAmberIcon />}
                        >
                            View Restricted Advice
                        </Button>
                    </Box>
                )}
                {!isHighRisk && (
                    <Box p={2} pt={0}>
                        <Button size="small" fullWidth variant="outlined" onClick={() => setOpenSafety(true)}>Read More</Button>
                    </Box>
                )}
            </Card>

            <Dialog open={openSafety} onClose={() => setOpenSafety(false)} maxWidth="sm">
                <DialogTitle sx={{ color: isHighRisk ? 'error.main' : 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                    {isHighRisk && <WarningAmberIcon />}
                    {advice.title}
                </DialogTitle>
                <DialogContent dividers>
                    {isHighRisk && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            <strong>Restricted Usage:</strong> This advice involves high-risk activities (e.g., chemical handling).
                            Ensure you have proper training and protective gear. Consult a local extension officer if unsure.
                        </Alert>
                    )}
                    {isMediumRisk && (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            <strong>Caution:</strong> Follow instructions carefully to avoid crop damage or environmental harm.
                        </Alert>
                    )}

                    <Typography variant="subtitle2" gutterBottom>Context:</Typography>
                    <Grid container spacing={1} sx={{ mb: 2 }}>
                        <Grid item xs={6}><Typography variant="body2"><strong>Crop:</strong> {advice.target_crop || 'General'}</Typography></Grid>
                        <Grid item xs={6}><Typography variant="body2"><strong>District:</strong> {advice.district || 'All'}</Typography></Grid>
                        <Grid item xs={6}><Typography variant="body2"><strong>Season:</strong> {advice.season || 'All'}</Typography></Grid>
                        <Grid item xs={6}><Typography variant="body2"><strong>Soil:</strong> {advice.soil_type || 'Any'}</Typography></Grid>
                    </Grid>

                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>{advice.content}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenSafety(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

const Advice = () => {
    const [adviceList, setAdviceList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        district: '',
        season: 'ALL',
        target_crop: '',
    });

    const fetchAdvice = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.district) params.append('district', filters.district);
            if (filters.season && filters.season !== 'ALL') params.append('season', filters.season);
            if (filters.target_crop) params.append('target_crop', filters.target_crop);

            const response = await apiClient.get(`/api/agronomic-advice/?${params.toString()}`);
            setAdviceList(response.data);
        } catch (error) {
            console.error('Error fetching advice:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdvice();
    }, [filters]);

    const handleFilterChange = (field) => (event) => {
        setFilters(prev => ({ ...prev, [field]: event.target.value }));
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Header */}
            <Paper
                elevation={0}
                sx={{
                    p: 4,
                    mb: 4,
                    background: 'linear-gradient(45deg, #1b5e20 30%, #43a047 90%)',
                    color: 'white',
                    borderRadius: 2
                }}
            >
                <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                    <Box>
                        <Typography variant="h3" fontWeight={700} gutterBottom>
                            RAB Agronomic Advice
                        </Typography>
                        <Typography variant="h6" sx={{ opacity: 0.9 }}>
                            Context-aware recommendations for your farm.
                        </Typography>
                    </Box>
                    <Box bgcolor="white" p={1} borderRadius={2} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <img src={rabLogo} alt="RAB Logo" style={{ height: '60px', objectFit: 'contain' }} />
                        <Box display={{ xs: 'none', sm: 'block' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1 }}>POWERED BY</Typography>
                            <Typography variant="body2" fontWeight="bold" color="text.primary">Rwanda Agriculture Board</Typography>
                        </Box>
                    </Box>
                </Box>
            </Paper>

            {/* Filters */}
            <Paper sx={{ p: 2, mb: 4 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>District</InputLabel>
                            <Select
                                value={filters.district}
                                label="District"
                                onChange={handleFilterChange('district')}
                            >
                                <MenuItem value=""><em>All Districts</em></MenuItem>
                                {DISTRICTS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Season</InputLabel>
                            <Select
                                value={filters.season}
                                label="Season"
                                onChange={handleFilterChange('season')}
                            >
                                {SEASONS.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search crop (e.g. Maize)..."
                            value={filters.target_crop}
                            onChange={handleFilterChange('target_crop')}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <Button fullWidth variant="contained" onClick={fetchAdvice} disabled={loading}>
                            Refresh
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Results */}
            {loading ? (
                <Box display="flex" justifyContent="center" my={8}>
                    <CircularProgress color="primary" />
                </Box>
            ) : adviceList.length === 0 ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                    No advice found matching your criteria. Try adjusting the filters.
                </Alert>
            ) : (
                <Grid container spacing={3}>
                    {adviceList.map((item) => (
                        <Grid item xs={12} sm={6} md={4} key={item.id}>
                            <AdviceCard advice={item} />
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Sticky Disclaimer */}
            <Paper
                sx={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    p: 2,
                    bgcolor: '#fff3e0',
                    borderTop: '1px solid #ffe0b2',
                    zIndex: 1000,
                    display: { xs: 'none', md: 'block' }
                }}
            >
                <Container maxWidth="xl">
                    <Typography variant="body2" color="text.secondary" align="center">
                        <strong>Disclaimer:</strong> This guidance is based on local agricultural recommendations via RAB.
                        For chemical use or serious crop disease, consult a certified agronomist.
                        Safety first!
                    </Typography>
                </Container>
            </Paper>
            <Box height={60} /> {/* Spacer for fixed footer */}
        </Container>
    );
};

export default Advice;
