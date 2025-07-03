import React from 'react';
import {
    Container, Typography, List, ListItem, ListItemText, Button,
    Grid, Divider, Box, IconButton, Badge, Paper, CircularProgress, Alert,
    Snackbar, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PaymentIcon from '@mui/icons-material/Payment';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import axios from "axios";

export default function Carrito() {
    const { user } = useAuth();
    const {
        cart,
        loading,
        error,
        updateQuantity,
        removeItem,
        calculateTotal,
        itemCount
    } = useCart();

    // En Carrito.js, añade esta función antes del componente
    const getProductStock = async (productoId) => {
        try {
            const response = await axios.get(
                `http://localhost:8080/api/inventario/venta/producto/${productoId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            return response.data.stock;
        } catch (err) {
            console.error("Error obteniendo stock:", err);
            return null;
        }
    };
    const [snackbar, setSnackbar] = React.useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [dialogEliminar, setDialogEliminar] = React.useState({
        open: false,
        productoId: null,
        productoNombre: ''
    });

    const confirmarEliminar = (productoId, productoNombre) => {
        setDialogEliminar({
            open: true,
            productoId,
            productoNombre
        });
    };

    const cerrarDialogoEliminar = () => {
        setDialogEliminar({
            open: false,
            productoId: null,
            productoNombre: ''
        });
    };

    const handleEliminarConfirmado = async () => {
        const { productoId } = dialogEliminar;
        try {
            const result = await removeItem(productoId);
            if (result.success) {
                setSnackbar({
                    open: true,
                    message: 'Producto eliminado correctamente',
                    severity: 'success'
                });
            } else {
                throw new Error(result.error || 'Error al eliminar producto');
            }
        } catch (err) {
            setSnackbar({
                open: true,
                message: err.message || 'Error al eliminar producto',
                severity: 'error'
            });
        } finally {
            cerrarDialogoEliminar();
        }
    };

    const handleCambiarCantidad = async (productoId, nuevaCantidad) => {
        if (nuevaCantidad < 1) return;

        try {
            const result = await updateQuantity(productoId, nuevaCantidad);
            if (result.success) {
                setSnackbar({
                    open: true,
                    message: 'Cantidad actualizada correctamente',
                    severity: 'success'
                });
            } else {
                // Manejar error de stock insuficiente
                // Luego en handleCambiarCantidad:
                if (result.status === 400 && result.error.includes('Stock insuficiente')) {
                    const stock = await getProductStock(productoId);
                    setSnackbar({
                        open: true,
                        message: `Stock insuficiente. Máximo disponible: ${stock || 'N/A'}`,
                        severity: 'error'
                    });
                } else {
                    setSnackbar({
                        open: true,
                        message: result.error || 'Error al actualizar cantidad',
                        severity: 'error'
                    });
                }
            }
        } catch (err) {
            setSnackbar({
                open: true,
                message: err.message || 'Error al actualizar cantidad',
                severity: 'error'
            });
        }
    };

// Función auxiliar para extraer el número de stock del mensaje de error
    const extraerStockDeMensaje = (mensaje) => {
        const match = mensaje.match(/\d+/);
        return match ? match[0] : null;
    };

    const total = calculateTotal();

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress size={60} />
        </Box>
    );

    if (error) return (
        <Container sx={{ py: 4 }}>
            <Alert severity="error" sx={{ mb: 3 }}>
                Error: {error}
            </Alert>
            <Button
                variant="contained"
                onClick={() => window.location.reload()}
            >
                Reintentar
            </Button>
        </Container>
    );

    return (
        <Container maxWidth="xl" sx={{ py: 4, mx: 0}}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Badge
                    badgeContent={itemCount}
                    color="primary"
                    sx={{ mr: 2 }}
                >
                    <ShoppingCartIcon fontSize="large" />
                </Badge>
                <Typography variant="h4" component="h1">
                    Tu Carrito de Compras
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {/* Lista de productos */}
                <Grid item xs={12} md={7}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                            Productos ({cart?.items?.length || 0})
                        </Typography>
                        <Divider sx={{ mb: 3 }} />

                        {!cart?.items || cart.items.length === 0 ? (
                            <Typography
                                variant="body1"
                                color="text.secondary"
                                sx={{ py: 4, textAlign: 'center' }}
                            >
                                No hay productos en tu carrito
                            </Typography>
                        ) : (
                            <Box sx={{ width: '100%', overflowX: 'auto' }}>
                                {/* Headers con más espacio */}
                                <Box sx={{
                                    display: 'grid',
                                    gridTemplateColumns: '120px minmax(200px, 1fr) 120px 150px 120px 80px',
                                    gap: 3,
                                    py: 1, // Reducido de py: 2
                                    px: 1,
                                    mb: 1,
                                    borderBottom: '2px solid',
                                    borderColor: 'divider',
                                    minWidth: 900
                                }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', fontSize: '0.75rem' }}>IMAGEN</Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>PRODUCTO</Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'right', fontSize: '0.75rem' }}>PRECIO UNIT.</Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', fontSize: '0.75rem' }}>CANTIDAD</Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'right', fontSize: '0.75rem' }}>SUBTOTAL</Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', fontSize: '0.75rem' }}>ACCIÓN</Typography>
                                </Box>

                                {/* Productos */}
                                {cart.items.map((item) => (
                                    <Box
                                        key={item.productoId}
                                        sx={{
                                            display: 'grid',
                                            gridTemplateColumns: '120px minmax(200px, 1fr) 120px 150px 120px 80px',
                                            gap: 3,
                                            alignItems: 'center',
                                            py: 1, // Reducido de py: 2
                                            px: 1,
                                            borderBottom: '1px solid',
                                            borderColor: 'divider',
                                            '&:hover': {
                                                backgroundColor: 'action.hover',
                                                borderRadius: 1
                                            },
                                            transition: 'background-color 0.3s ease',
                                            minWidth: 900
                                        }}
                                    >
                                        {/* Imagen (sin cambios) */}
                                        <Box
                                            component="img"
                                            src={item.imagenesUrls?.[0] || 'https://via.placeholder.com/100'}
                                            alt={item.nombre}
                                            sx={{
                                                width: 80, // Reducido de 100
                                                height: 80, // Reducido de 100
                                                objectFit: 'cover',
                                                borderRadius: 1,
                                                margin: '0 auto'
                                            }}
                                        />

                                        {/* Nombre */}
                                        <Typography variant="body2" sx={{ fontWeight: 'medium', pr: 2, fontSize: '0.875rem' }}>
                                            {item.nombre}
                                        </Typography>

                                        {/* Precio unitario */}
                                        <Typography variant="body2" sx={{ textAlign: 'right', pr: 2, fontSize: '0.875rem' }}>
                                            ${item.precioUnitario.toLocaleString()}
                                        </Typography>

                                        {/* Cantidad */}
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 1, // Reducido de gap: 2
                                            px: 1 // Reducido de px: 2
                                        }}>
                                            <IconButton
                                                onClick={() => handleCambiarCantidad(item.productoId, item.cantidad - 1)}
                                                disabled={item.cantidad <= 1}
                                                size="small" // Cambiado de size="medium"
                                                sx={{
                                                    p: 0.5, // Reducido de p: 1
                                                    border: '1px solid',
                                                    borderColor: 'divider'
                                                }}
                                            >
                                                <RemoveIcon fontSize="small" />
                                            </IconButton>
                                            <Typography variant="body2" sx={{
                                                minWidth: 24, // Reducido de 30
                                                textAlign: 'center',
                                                fontWeight: 'bold',
                                                fontSize: '0.875rem'
                                            }}>
                                                {item.cantidad}
                                            </Typography>
                                            <IconButton
                                                onClick={() => handleCambiarCantidad(item.productoId, item.cantidad + 1)}
                                                size="small" // Cambiado de size="medium"
                                                sx={{
                                                    p: 0.5, // Reducido de p: 1
                                                    border: '1px solid',
                                                    borderColor: 'divider'
                                                }}
                                            >
                                                <AddIcon fontSize="small" />
                                            </IconButton>
                                        </Box>

                                        {/* Subtotal */}
                                        <Typography variant="body2" sx={{
                                            fontWeight: 'bold',
                                            textAlign: 'right',
                                            pr: 2, // Reducido de pr: 3
                                            fontSize: '0.875rem'
                                        }}>
                                            ${(item.precioUnitario * item.cantidad).toLocaleString()}
                                        </Typography>

                                        {/* Eliminar (sin cambios) */}
                                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                            <IconButton
                                                onClick={() => confirmarEliminar(item.productoId, item.nombre)}
                                                color="error"
                                                size="small" // Cambiado de size="medium"
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* Resumen de compra */}
                <Grid item xs={12} md={5}>
                    <Paper elevation={3} sx={{
                        p: 3,
                        position: 'sticky',
                        top: 16,
                        borderRadius: 3, // Bordes más redondeados
                        minWidth: 300 // Ancho mínimo garantizado
                    }}>
                        <Typography variant="h5" sx={{
                            mb: 2,
                            fontWeight: 'bold',
                            color: 'primary.main' // Color destacado
                        }}>
                            Resumen de Compra
                        </Typography>

                        <Divider sx={{
                            mb: 2,
                            borderColor: 'divider',
                            borderBottomWidth: 2 // Línea más gruesa
                        }} />

                        {/* Lista de productos */}
                        <Box sx={{
                            mb: 2,
                            maxHeight: 300,
                            overflowY: 'auto',
                            pr: 1 // Espacio para scroll
                        }}>
                            {cart?.items?.map(item => (
                                <Box
                                    key={item.productoId}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        mb: 1.5,
                                        py: 1,
                                        px: 1,
                                        '&:hover': {
                                            bgcolor: 'action.hover',
                                            borderRadius: 1
                                        }
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Box
                                            component="img"
                                            src={item.imagenesUrls?.[0] || 'https://via.placeholder.com/60'}
                                            alt={item.nombre}
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                objectFit: 'cover',
                                                borderRadius: 1,
                                                mr: 1.5
                                            }}
                                        />
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {item.nombre}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2">
                                        x{item.cantidad} • ${(item.precioUnitario * item.cantidad).toLocaleString()}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>

                        <Divider sx={{
                            my: 2,
                            borderColor: 'divider',
                            borderBottomWidth: 2
                        }} />

                        {/* Total */}
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 3,
                            py: 1,
                            px: 1,
                            bgcolor: 'background.paper',
                            borderRadius: 1
                        }}>
                            <Typography variant="h6">Total</Typography>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                ${total.toLocaleString()}
                            </Typography>
                        </Box>

                        {/* Botón de pago */}
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            size="large"
                            startIcon={<PaymentIcon />}
                            disabled={!cart?.items || cart.items.length === 0}
                            sx={{
                                py: 1.5,
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                borderRadius: 2, // Bordes más redondeados
                                boxShadow: 2,
                                '&:hover': {
                                    boxShadow: 4,
                                    transform: 'translateY(-2px)'
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Proceder al Pago
                        </Button>
                    </Paper>
                </Grid>
            </Grid>

            {/* Diálogo de confirmación para eliminar */}
            <Dialog
                open={dialogEliminar.open}
                onClose={cerrarDialogoEliminar}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    ¿Eliminar producto del carrito?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        ¿Estás seguro que deseas eliminar "{dialogEliminar.productoNombre}" de tu carrito?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cerrarDialogoEliminar}>Cancelar</Button>
                    <Button
                        onClick={handleEliminarConfirmado}
                        color="error"
                        autoFocus
                    >
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar para notificaciones */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}