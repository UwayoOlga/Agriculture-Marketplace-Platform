import { useEffect, useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Button,
    Chip,
    Stack,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import api from '../services/api';

const formatRwf = (value) =>
    new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(Number(value) || 0);

const statusColor = (status) => {
    switch (status) {
        case 'PENDING':
            return 'warning';
        case 'APPROVED':
            return 'success';
        case 'REJECTED':
            return 'error';
        default:
            return 'default';
    }
};

const FarmerCartRequests = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dialog, setDialog] = useState({ open: false, requestId: null, action: null, note: '' });

    const loadRequests = async () => {
        setLoading(true);
        try {
            const response = await api.get('/farmer/cart-requests/');
            setRequests(response.data || []);
        } catch (e) {
            console.error('Failed to load cart requests', e);
            enqueueSnackbar('Failed to load cart requests', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    const openDialog = (requestId, action) => {
        setDialog({ open: true, requestId, action, note: '' });
    };

    const closeDialog = () => setDialog({ open: false, requestId: null, action: null, note: '' });

    const submitAction = async () => {
        try {
            await api.patch(`/farmer/cart-requests/${dialog.requestId}/action/`, {
                action: dialog.action, // 'approve' or 'reject'
                reason: dialog.action === 'reject' ? dialog.note : undefined,
            });
            enqueueSnackbar('Order request updated', { variant: 'success' });
            closeDialog();
            loadRequests();
        } catch (e) {
            console.error('Failed to update order request', e);
            enqueueSnackbar('Failed to update order request', { variant: 'error' });
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                Order Requests
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
                Buyers who want to purchase your products. Approve or reject their requests.
            </Typography>

            {loading ? (
                <Box display="flex" justifyContent="center" my={4}>
                    <CircularProgress />
                </Box>
            ) : requests.length === 0 ? (
                <Alert severity="info">No order requests yet.</Alert>
            ) : (
                <Paper>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Buyer</TableCell>
                                <TableCell>Product</TableCell>
                                <TableCell>Quantity</TableCell>
                                <TableCell>Price</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {requests.map((req) => (
                                <TableRow key={req.id}>
                                    <TableCell>{req.id}</TableCell>
                                    <TableCell>
                                        <Chip label={req.status} color={statusColor(req.status)} size="small" />
                                    </TableCell>
                                    <TableCell>{new Date(req.created_at).toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Stack spacing={0.5}>
                                            <Typography variant="body2">{req.buyer_details?.username || 'Buyer'}</Typography>
                                            {req.buyer_details?.phone_number && (
                                                <Typography variant="caption" color="text.secondary">
                                                    {req.buyer_details.phone_number}
                                                </Typography>
                                            )}
                                        </Stack>
                                    </TableCell>
                                    <TableCell>{req.product_details?.name || 'Product'}</TableCell>
                                    <TableCell>{req.quantity}</TableCell>
                                    <TableCell>{formatRwf((req.product_details?.price || 0) * req.quantity)}</TableCell>
                                    <TableCell align="right">
                                        {req.status === 'PENDING' && (
                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    color="success"
                                                    onClick={() => openDialog(req.id, 'approve')}
                                                >
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    color="error"
                                                    onClick={() => openDialog(req.id, 'reject')}
                                                >
                                                    Reject
                                                </Button>
                                            </Stack>
                                        )}
                                        {req.status === 'APPROVED' && (
                                            <Chip label="Approved" color="success" size="small" variant="outlined" />
                                        )}
                                        {req.status === 'REJECTED' && (
                                            <Chip label="Rejected" color="error" size="small" variant="outlined" />
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Paper>
            )}

            <Dialog open={dialog.open} onClose={closeDialog} fullWidth maxWidth="sm">
                <DialogTitle>{dialog.action === 'approve' ? 'Approve Order Request' : 'Reject Order Request'}</DialogTitle>
                <DialogContent>
                    {dialog.action === 'reject' && (
                        <TextField
                            fullWidth
                            label="Reason (Optional)"
                            multiline
                            minRows={2}
                            value={dialog.note}
                            onChange={(e) => setDialog((prev) => ({ ...prev, note: e.target.value }))}
                            sx={{ mt: 2 }}
                        />
                    )}
                    {dialog.action === 'approve' && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            Approve this order request. The buyer will be notified and can proceed to checkout.
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>Cancel</Button>
                    <Button variant="contained" color={dialog.action === 'approve' ? 'success' : 'error'} onClick={submitAction}>
                        {dialog.action === 'approve' ? 'Approve' : 'Reject'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default FarmerCartRequests;
