import React, { useState, useEffect, useRef } from 'react';
import {
    Container, Typography, Grid, Card, CardContent, CardActions, Button,
    Box, CircularProgress, Alert, Pagination, Chip, Dialog, DialogTitle,
    DialogContent, Divider, IconButton, AppBar,
    Toolbar, ToggleButton, ToggleButtonGroup, Badge, Snackbar
} from '@mui/material';
import {
    ShoppingCart, Close, Add, Remove, DirectionsBike, Settings, Apps,
    ChevronLeft, ChevronRight
} from '@mui/icons-material';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const API_URL = 'http://localhost:8080/api/inventario';

const categorias = [
    { id: 'todos', nombre: 'Todos', icono: <Apps /> },
    { id: 'bicicleta', nombre: 'Bicicletas', icono: <DirectionsBike /> },
    { id: 'componente', nombre: 'Componentes', icono: <Settings /> }
];

const PRODUCTOS_POR_PAGINA = 8;

export default function Catalogo() {
    const { user } = useAuth();
    const { addToCart, itemCount } = useCart();
    const [paginaActual, setPaginaActual] = useState(1);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todos');
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [productos, setProductos] = useState([]);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [unidades, setUnidades] = useState(1);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
    const [showZoom, setShowZoom] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '' });
    const imgRef = useRef(null);
    const thumbnailsRef = useRef(null);

    // Fetch productos
    useEffect(() => {
        const fetchProductos = async () => {
            try {
                setCargando(true);
                const response = await fetch(`${API_URL}/venta`);
                if (!response.ok) throw new Error('Error al cargar productos');
                const data = await response.json();
                setProductos(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setCargando(false);
            }
        };
        fetchProductos();
    }, []);

    // Handlers para el carrusel
    const nextImage = () => {
        setCurrentImageIndex(prev =>
            (prev + 1) % (productoSeleccionado?.imagenesUrls?.length || 1)
        );
        setShowZoom(false);
    };

    const prevImage = () => {
        setCurrentImageIndex(prev =>
            (prev - 1 + (productoSeleccionado?.imagenesUrls?.length || 1)) %
            (productoSeleccionado?.imagenesUrls?.length || 1)
        );
        setShowZoom(false);
    };

    const handleAddToCart = async (producto, cantidad) => {
        if (!user) {
            setSnackbar({
                open: true,
                message: 'Debes iniciar sesión para agregar productos al carrito',
                severity: 'error'
            });
            return;
        }

        // Validación adicional en frontend (opcional)
        if (cantidad > producto.stock) {
            setSnackbar({
                open: true,
                message: `No hay suficiente stock. Disponible: ${producto.stock}`,
                severity: 'error'
            });
            return;
        }

        const result = await addToCart(producto.id, cantidad);

        if (result.success) {
            setSnackbar({
                open: true,
                message: result.action === 'added'
                    ? `${cantidad} ${producto.nombre} agregado(s) al carrito`
                    : `Cantidad actualizada: ${result.cart.items.find(i => i.productoId === producto.id).cantidad} unidades`,
                severity: 'success'
            });
        } else {
            setSnackbar({
                open: true,
                message: result.error || 'Error al agregar al carrito',
                severity: 'error'
            });
        }
    };

    const selectImage = (index) => {
        setCurrentImageIndex(index);
        setShowZoom(false);
    };

    // Handlers para zoom
    const handleMouseMove = (e) => {
        if (!imgRef.current) return;
        const { left, top, width, height } = imgRef.current.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setZoomPosition({ x, y });
    };

    const handleMouseEnter = () => setShowZoom(true);
    const handleMouseLeave = () => setShowZoom(false);

    // Handlers para diálogo
    const handleOpenDialog = (producto) => {
        setProductoSeleccionado(producto);
        setUnidades(1);
        setCurrentImageIndex(0);
        setShowZoom(false);
    };

    const handleCloseDialog = () => {
        setProductoSeleccionado(null);
        setShowZoom(false);
    };

    const handleChangePagina = (event, newPage) => {
        setPaginaActual(newPage);
    };

    // Handlers para unidades
    const handleIncrementar = () => {
        setUnidades(prev => Math.min(prev + 1, productoSeleccionado?.stock || 1));
    };

    const handleDecrementar = () => {
        setUnidades(prev => Math.max(prev - 1, 1));
    };

    // Filtrado y paginación
    const productosFiltrados = productos.filter(producto =>
        categoriaSeleccionada === 'todos' || producto.tipo === categoriaSeleccionada
    );

    const totalPaginas = Math.ceil(productosFiltrados.length / PRODUCTOS_POR_PAGINA);
    const productosPagina = productosFiltrados.slice(
        (paginaActual - 1) * PRODUCTOS_POR_PAGINA,
        paginaActual * PRODUCTOS_POR_PAGINA
    );

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    if (error) {
        return (
            <Container sx={{ py: 4 }}>
                <Alert severity="error" sx={{ mb: 3 }}>
                    Error: {error} - Verifica que el backend esté corriendo en {API_URL}
                </Alert>
                <Button variant="contained" onClick={() => window.location.reload()}>
                    Reintentar
                </Button>
            </Container>
        );
    }

    return (
        <>
            <AppBar position="static" color="primary" sx={{ mb: 3 }}>
                <Toolbar>
                    <ToggleButtonGroup
                        value={categoriaSeleccionada}
                        exclusive
                        onChange={(_, nuevaCategoria) => {
                            if (nuevaCategoria) {
                                setCategoriaSeleccionada(nuevaCategoria);
                                setPaginaActual(1);
                            }
                        }}
                        sx={{ mr: 2 }}
                    >
                        {categorias.map(categoria => (
                            <ToggleButton
                                key={categoria.id}
                                value={categoria.id}
                                sx={{ color: 'white' }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {categoria.icono}
                                    {categoria.nombre}
                                </Box>
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                    <Box sx={{ flexGrow: 1 }} />
                    <IconButton
                        color="inherit"
                        component="a"
                        href="/cliente/cart"
                    >
                        <Badge badgeContent={itemCount} color="error">
                            <ShoppingCart />
                        </Badge>
                    </IconButton>
                </Toolbar>
            </AppBar>

            <Container maxWidth="xl" sx={{ py: 2 }}>
                {cargando ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress size={60} />
                    </Box>
                ) : (
                    <>
                        {productosFiltrados.length === 0 ? (
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                py: 10,
                                textAlign: 'center'
                            }}>
                                <Typography variant="h5" color="text.secondary" gutterBottom>
                                    {categoriaSeleccionada === 'todos'
                                        ? 'No hay productos disponibles'
                                        : `No hay ${categoriaSeleccionada === 'bicicleta' ? 'bicicletas' : 'componentes'} disponibles`}
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Por favor, intenta con otra categoría o verifica más tarde.
                                </Typography>
                            </Box>
                        ) : (
                            <>
                                <Grid container spacing={3} sx={{ justifyContent: 'center' }}>
                                    {productosPagina.map((producto) => (
                                        <Grid item key={producto.id} xs={12} sm={6} md={4} lg={3} sx={{ display: 'flex' }}>
                                            <Card
                                                onClick={() => handleOpenDialog(producto)}
                                                sx={{
                                                    width: '100%',
                                                    minWidth: 340,
                                                    maxWidth: 340,
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    borderRadius: 2,
                                                    boxShadow: 2,
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        transform: 'scale(1.03)',
                                                        boxShadow: 4,
                                                        cursor: 'pointer'
                                                    }
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        height: 180,
                                                        width: '100%',
                                                        bgcolor: 'grey.100',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        overflow: 'hidden',
                                                        flexShrink: 0
                                                    }}>
                                                    {producto.imagenesUrls?.[0] ? (
                                                        <img
                                                            src={producto.imagenesUrls[0]}
                                                            alt={producto.nombre}
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover'
                                                            }}
                                                        />
                                                    ) : (
                                                        producto.tipo === 'bicicleta' ? (
                                                            <DirectionsBike sx={{ fontSize: 60, color: 'action.active' }} />
                                                        ) : (
                                                            <Settings sx={{ fontSize: 60, color: 'action.active' }} />
                                                        )
                                                    )}
                                                </Box>

                                                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Stock: {producto.stock}
                                                        </Typography>
                                                        <Chip
                                                            label={producto.tipo === 'bicicleta' ? 'Bicicleta' : 'Componente'}
                                                            size="small"
                                                            color="secondary"
                                                        />
                                                    </Box>

                                                    <Typography
                                                        gutterBottom
                                                        variant="h6"
                                                        component="h3"
                                                        sx={{
                                                            fontWeight: 600,
                                                            mb: 1,
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                            minHeight: '3em'
                                                        }}
                                                    >
                                                        {producto.nombre}
                                                    </Typography>

                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{
                                                            mb: 2,
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 3,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                            minHeight: '4.5em'
                                                        }}
                                                    >
                                                        {producto.descripcion}
                                                    </Typography>

                                                    <Typography
                                                        variant="h6"
                                                        color="primary"
                                                        sx={{
                                                            fontWeight: 700,
                                                            mt: 'auto'
                                                        }}
                                                    >
                                                        ${producto.precio.toLocaleString('es-CL')}
                                                    </Typography>
                                                </CardContent>

                                                <CardActions sx={{ p: 2 }}>
                                                    <Button
                                                        fullWidth
                                                        variant="contained"
                                                        startIcon={<ShoppingCart />}
                                                        sx={{
                                                            fontWeight: 600,
                                                            py: 1
                                                        }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleAddToCart(producto, 1);
                                                        }}
                                                        disabled={producto.stock <= 0}
                                                    >
                                                        {producto.stock > 0 ? 'Agregar al carrito' : 'Sin stock'}
                                                    </Button>
                                                </CardActions>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>

                                {totalPaginas > 1 && (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                                        <Pagination
                                            count={totalPaginas}
                                            page={paginaActual}
                                            onChange={handleChangePagina}
                                            color="primary"
                                            size="large"
                                        />
                                    </Box>
                                )}
                            </>
                        )}
                    </>
                )}
            </Container>

            {/* Diálogo con Carrusel */}
            <Dialog
                open={Boolean(productoSeleccionado)}
                onClose={handleCloseDialog}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { borderRadius: 2, p: 3 } }}
            >
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
                    {/* Sección de Imagen */}
                    <Box sx={{ width: { md: '50%' }, position: 'relative' }}>
                        <Box
                            sx={{
                                aspectRatio: '1/1',
                                bgcolor: 'grey.100',
                                borderRadius: 2,
                                overflow: 'hidden',
                                position: 'relative',
                                mb: 2
                            }}
                            onMouseMove={handleMouseMove}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            {productoSeleccionado?.imagenesUrls?.[currentImageIndex] ? (
                                <img
                                    ref={imgRef}
                                    src={productoSeleccionado.imagenesUrls[currentImageIndex]}
                                    alt={productoSeleccionado.nombre}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain',
                                        transform: showZoom ? 'scale(2)' : 'scale(1)',
                                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                                        transition: 'transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)',
                                        cursor: 'zoom-in'
                                    }}
                                />
                            ) : (
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                    {productoSeleccionado?.tipo === 'bicicleta' ? (
                                        <DirectionsBike sx={{ fontSize: 60, color: 'action.active' }} />
                                    ) : (
                                        <Settings sx={{ fontSize: 60, color: 'action.active' }} />
                                    )}
                                </Box>
                            )}

                            {productoSeleccionado?.imagenesUrls?.length > 1 && (
                                <>
                                    <IconButton
                                        onClick={prevImage}
                                        sx={{
                                            position: 'absolute',
                                            left: 8,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            bgcolor: 'rgba(0,0,0,0.5)',
                                            color: 'white',
                                            '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                                        }}
                                    >
                                        <ChevronLeft />
                                    </IconButton>
                                    <IconButton
                                        onClick={nextImage}
                                        sx={{
                                            position: 'absolute',
                                            right: 8,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            bgcolor: 'rgba(0,0,0,0.5)',
                                            color: 'white',
                                            '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                                        }}
                                    >
                                        <ChevronRight />
                                    </IconButton>
                                </>
                            )}
                        </Box>

                        {productoSeleccionado?.imagenesUrls?.length > 1 && (
                            <Box
                                ref={thumbnailsRef}
                                sx={{
                                    display: 'flex',
                                    gap: 1,
                                    overflowX: 'auto',
                                    py: 1,
                                    '&::-webkit-scrollbar': { height: '4px' },
                                    '&::-webkit-scrollbar-thumb': { bgcolor: 'grey.400' }
                                }}
                            >
                                {productoSeleccionado.imagenesUrls.map((img, index) => (
                                    <Box
                                        key={index}
                                        onClick={() => selectImage(index)}
                                        sx={{
                                            width: 60,
                                            height: 60,
                                            minWidth: 60,
                                            bgcolor: 'grey.100',
                                            borderRadius: 1,
                                            overflow: 'hidden',
                                            cursor: 'pointer',
                                            border: currentImageIndex === index ? '2px solid primary.main' : '1px solid grey.300',
                                            opacity: currentImageIndex === index ? 1 : 0.7,
                                            transition: 'all 0.2s ease',
                                            '&:hover': { opacity: 1, borderColor: 'primary.main' }
                                        }}
                                    >
                                        <img
                                            src={img}
                                            alt={`Miniatura ${index + 1}`}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Box>

                    {/* Sección de Información */}
                    <Box sx={{ width: { md: '50%' }, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                            {productoSeleccionado?.nombre}
                        </Typography>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Chip
                                label={productoSeleccionado?.tipo === 'bicicleta' ? 'Bicicleta' : 'Componente'}
                                size="small"
                                color="primary"
                                variant="outlined"
                            />
                            <Typography variant="h5" fontWeight="bold">
                                ${productoSeleccionado?.precio.toLocaleString('es-CL')}
                            </Typography>
                        </Box>

                        <Typography variant="body2" color="text.secondary">
                            Stock disponible: {productoSeleccionado?.stock} unidades
                        </Typography>

                        <Typography variant="body1" sx={{ my: 2, color: 'text.primary' }}>
                            {productoSeleccionado?.descripcion}
                        </Typography>

                        <Box sx={{ mt: 'auto', pt: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Cantidad:
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 1,
                                    width: '120px',
                                    justifyContent: 'space-between'
                                }}>
                                    <IconButton
                                        onClick={handleDecrementar}
                                        disabled={unidades <= 1}
                                        size="small"
                                        sx={{ color: 'text.primary' }}
                                    >
                                        <Remove />
                                    </IconButton>
                                    <Typography sx={{ px: 1 }}>{unidades}</Typography>
                                    <IconButton
                                        onClick={handleIncrementar}
                                        disabled={unidades >= productoSeleccionado?.stock}
                                        size="small"
                                        sx={{ color: 'text.primary' }}
                                    >
                                        <Add />
                                    </IconButton>
                                </Box>

                                <Button
                                    variant="contained"
                                    fullWidth
                                    size="large"
                                    startIcon={<ShoppingCart />}
                                    sx={{
                                        py: 1.5,
                                        fontWeight: 'bold',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}
                                    onClick={() => {
                                        handleAddToCart(productoSeleccionado, unidades);
                                        handleCloseDialog();
                                    }}
                                    disabled={productoSeleccionado?.stock <= 0}
                                >
                                    {productoSeleccionado?.stock > 0
                                        ? `Agregar al carrito (${unidades})`
                                        : 'Sin stock'}
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity || 'info'}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
}