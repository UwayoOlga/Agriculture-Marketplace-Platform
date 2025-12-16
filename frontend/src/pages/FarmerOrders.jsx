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
    case 'PENDING_APPROVAL':
      return 'warning';
    case 'PENDING_PAYMENT':
      return 'info';
    case 'PAID':
    case 'COMPLETED':
      return 'success';
    case 'REJECTED':
    case 'CANCELLED':
      return 'error';
    default:
      return 'default';
  }
};

const FarmerOrders = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState({ open: false, orderId: null, action: null, note: '' });

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/farmer/orders/');
      setOrders(response.data || []);
    } catch (e) {
      console.error('Failed to load orders', e);
      enqueueSnackbar('Failed to load orders', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const openDialog = (orderId, action) => {
    setDialog({ open: true, orderId, action, note: '' });
  };

  const closeDialog = () => setDialog({ open: false, orderId: null, action: null, note: '' });

  const submitAction = async () => {
    try {
      await api.patch(`/farmer/orders/${dialog.orderId}/status/`, {
        action: dialog.action, // 'approve' or 'reject'
        rejection_reason: dialog.action === 'reject' ? dialog.note : undefined,
      });
      enqueueSnackbar('Order updated', { variant: 'success' });
      closeDialog();
      loadOrders();
    } catch (e) {
      console.error('Failed to update order', e);
      enqueueSnackbar('Failed to update order', { variant: 'error' });
    }
  };

  const renderItems = (items) => {
    if (!items || items.length === 0) return '—';
    return items.map((it) => `${it.quantity} x ${it.product_details?.name || 'Product'} @ ${it.price_at_time}`).join(', ');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Incoming Orders
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : orders.length === 0 ? (
        <Alert severity="info">No new orders yet.</Alert>
      ) : (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order #</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Buyer</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Total</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>
                    <Chip label={order.status} color={statusColor(order.status)} size="small" />
                  </TableCell>
                  <TableCell>{new Date(order.order_date).toLocaleString()}</TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography variant="body2">{order.buyer?.username || 'Buyer'}</Typography>
                      {order.buyer?.phone_number && (
                        <Typography variant="caption" color="text.secondary">
                          {order.buyer.phone_number}
                        </Typography>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 260 }}>
                    <Typography variant="body2">{renderItems(order.items)}</Typography>
                  </TableCell>
                  <TableCell>{formatRwf(order.total_amount)}</TableCell>
                  <TableCell align="right">
                    {order.status === 'PENDING_APPROVAL' && (
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => openDialog(order.id, 'approve')}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => openDialog(order.id, 'reject')}
                        >
                          Reject
                        </Button>
                      </Stack>
                    )}
                    {(order.status === 'PENDING_PAYMENT' || order.status === 'PAID') && (
                      <Chip label="Accepted" color="success" size="small" variant="outlined" />
                    )}
                    {order.status === 'REJECTED' && (
                      <Chip label="Rejected" color="error" size="small" variant="outlined" />
                    )}

                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )
      }

      <Dialog open={dialog.open} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>{dialog.action === 'approve' ? 'Approve Order' : 'Reject Order'}</DialogTitle>
        <DialogContent>
          {dialog.action === 'reject' && (
            <TextField
              fullWidth
              label="Reason"
              multiline
              minRows={2}
              value={dialog.note}
              onChange={(e) => setDialog((prev) => ({ ...prev, note: e.target.value }))}
              sx={{ mt: 2 }}
            />
          )}
          {dialog.action === 'approve' && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Confirm this order. The buyer will be notified.
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
    </Container >
  );
};

export default FarmerOrders;

