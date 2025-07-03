import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Table, TableHead, TableRow, TableCell,
    TableBody, IconButton, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Button, TableContainer, Paper,
    Box, Tooltip, Alert, Snackbar, Grid, Divider, MenuItem, Select,
    FormControl, InputLabel, Chip, Drawer, Avatar, Stack, InputAdornment
} from '@mui/material';
// Agregar estos imports junto con los otros iconos
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    Add as AddIcon,
    DirectionsBike as BikeIcon,
    ShoppingCart as SellIcon,
    CalendarToday as RentIcon,
    Close as CloseIcon,
    CloudUpload as UploadIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/inventario';

export default function GestionarBicicletas() {
    const [bicicletasVenta, setBicicletasVenta] = useState([]);
    const [bicicletasArriendo, setBicicletasArriendo] = useState([]);
    const [bicicletaEditar, setBicicletaEditar] = useState(null);
    const [bicicletaEliminar, setBicicletaEliminar] = useState(null);
    const [busqueda, setBusqueda] = useState('');
    const [nuevaBicicleta, setNuevaBicicleta] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [formErrors, setFormErrors] = useState({});
    const [tipoBicicleta, setTipoBicicleta] = useState('venta');
    const [openDrawer, setOpenDrawer] = useState(false);
    const [imagenesPreview, setImagenesPreview] = useState([]);
    const [imagenesSubir, setImagenesSubir] = useState([]);
    const [formTipoBicicleta, setFormTipoBicicleta] = useState('venta');
    // Agregar esto junto con los otros estados al inicio del componente
    const [idDisponible, setIdDisponible] = useState(null);
    const [validandoId, setValidandoId] = useState(false);
    // Cargar datos iniciales
    useEffect(() => {
        cargarBicicletas();
    }, []);

    // Agregar esta función junto con las otras funciones del componente
    const verificarDisponibilidadId = async (id) => {
        if (!id) {
            setIdDisponible(null);
            return;
        }
        setValidandoId(true);
        try {
            if (formTipoBicicleta === 'venta') {
                await axios.get(`${API_URL}/bicicletas/venta/${id}`);
                setIdDisponible(false); // Si la petición no falla, el ID existe
            } else {
                await axios.get(`${API_URL}/bicicletas/arriendo/${id}`);
                setIdDisponible(false); // Si la petición no falla, el ID existe
            }
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setIdDisponible(true); // ID no encontrado, está disponible
            } else {
                setIdDisponible(null); // Error desconocido, no mostrar estado
            }
        } finally {
            setValidandoId(false);
        }
    };
    const cargarBicicletas = async () => {
        try {
            const [ventaResponse, arriendoResponse] = await Promise.all([
                axios.get(`${API_URL}/venta/bicicleta`),
                axios.get(`${API_URL}/arriendo`)
            ]);

            setBicicletasVenta(ventaResponse.data);
            setBicicletasArriendo(arriendoResponse.data);
        } catch (error) {
            showSnackbar('Error al cargar las bicicletas', 'error');
            console.error('Error fetching data:', error);
        }
    };

    const handleGuardarEdicion = async () => {
        if (nuevaBicicleta && idDisponible === false) {
            showSnackbar('El ID ingresado ya está en uso', 'error');
            return;
        }
        const errors = {};
        if (tipoBicicleta === 'arriendo') {
            if (bicicletaEditar.valorGarantia < 0) {
                errors.valorGarantia = 'Debe ser mayor o igual a 0';
            }
        }
        if (!bicicletaEditar.nombre) errors.nombre = 'Requerido';

        if (tipoBicicleta === 'venta') {
            if (bicicletaEditar.precio <= 0) errors.precio = 'Debe ser mayor a 0';
            if (bicicletaEditar.stock < 0) errors.stock = 'No puede ser negativo';
        } else {
            if (bicicletaEditar.tarifaDiaria <= 0) errors.tarifaDiaria = 'Debe ser mayor a 0';
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            if (tipoBicicleta === 'venta') {
                if (nuevaBicicleta) {
                    // Crear nueva bicicleta de venta
                    const formData = new FormData();
                    formData.append('producto', JSON.stringify(bicicletaEditar));
                    imagenesSubir.forEach((file) => {
                        formData.append('imagenes', file);
                    });
                    const response = await axios.post(`${API_URL}/venta/con-imagenes`, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });
                    setBicicletasVenta([...bicicletasVenta, response.data]);
                } else {
                    // Actualizar bicicleta de venta con imágenes
                    const formData = new FormData();
                    formData.append('producto', JSON.stringify(bicicletaEditar));
                    if (imagenesSubir.length > 0) {
                        imagenesSubir.forEach((file) => {
                            formData.append('imagenes', file);
                        });
                    }
                    const response = await axios.put(`${API_URL}/venta/${bicicletaEditar.id}/con-imagenes`, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });
                    setBicicletasVenta(bicicletasVenta.map(b => b.id === bicicletaEditar.id ? response.data : b));
                }
            } else {
                // Código existente para arriendo...
                if (nuevaBicicleta) {
                    // Crear nueva bicicleta de arriendo
                    const response = await axios.post(`${API_URL}/arriendo`, bicicletaEditar);
                    setBicicletasArriendo([...bicicletasArriendo, response.data]);
                } else {
                    // Actualizar bicicleta de arriendo
                    const response = await axios.put(`${API_URL}/arriendo/${bicicletaEditar.id}`, bicicletaEditar);
                    setBicicletasArriendo(prev => prev.map(b =>
                        b.id === bicicletaEditar.id ? { ...response.data } : b
                    ));
                }
            }

            setOpenDrawer(false);
            setBicicletaEditar(null);
            setNuevaBicicleta(false);
            setFormErrors({});
            setImagenesPreview([]);
            setImagenesSubir([]);
            showSnackbar(nuevaBicicleta ? 'Bicicleta creada' : 'Bicicleta actualizada', 'success');
        } catch (error) {
            console.error('Error al guardar:', error);
            showSnackbar(`Error al ${nuevaBicicleta ? 'crear' : 'actualizar'} la bicicleta`, 'error');
        }
    };


    const handleNuevaBicicleta = () => {
        setFormTipoBicicleta(tipoBicicleta);
        setBicicletaEditar(formTipoBicicleta === 'venta' ? {
            id: '',
            nombre: '',
            descripcion: '',
            precio: 0,
            stock: 0,
            tipo: 'bicicleta',
            imagenesUrls: []
        } : {
            id: '',
            nombre: '',
            descripcion: '',
            tarifaDiaria: 0,
            disponible: true,
            valorGarantia: 0  // Nuevo campo
        });
        setNuevaBicicleta(true);
        setOpenDrawer(true);
    };

    const handleEliminar = async () => {
        try {
            if (tipoBicicleta === 'venta') {
                await axios.delete(`${API_URL}/venta/${bicicletaEliminar.id}`);
                setBicicletasVenta(bicicletasVenta.filter(b => b.id !== bicicletaEliminar.id));
            } else {
                await axios.delete(`${API_URL}/arriendo/${bicicletaEliminar.id}`);
                setBicicletasArriendo(bicicletasArriendo.filter(b => b.id !== bicicletaEliminar.id));
            }
            setBicicletaEliminar(null);
            showSnackbar('Bicicleta eliminada', 'info');
        } catch (error) {
            console.error('Error al eliminar:', error);
            showSnackbar('Error al eliminar la bicicleta', 'error');
        }
    };

    const handleEditarBicicleta = (bicicleta) => {
        setBicicletaEditar({ ...bicicleta });
        setNuevaBicicleta(false);
        setOpenDrawer(true);
        setImagenesPreview(bicicleta.imagenesUrls || []);
    };

    const handleImagenChange = (e) => {
        const files = Array.from(e.target.files);
        const previews = files.map(file => URL.createObjectURL(file));
        setImagenesPreview([...imagenesPreview, ...previews]);
        setImagenesSubir([...imagenesSubir, ...files]);
    };

    const eliminarImagenPreview = async (index) => {
        try {
            const url = imagenesPreview[index];

            // Si es una URL existente (no una preview local)
            if (url.startsWith('http')) {
                await axios.delete(`${API_URL}/venta/${bicicletaEditar.id}/imagenes`, {
                    params: { urlImagen: url }
                });
            }

            const nuevasPreviews = [...imagenesPreview];
            nuevasPreviews.splice(index, 1);
            setImagenesPreview(nuevasPreviews);

            const nuevasImagenesSubir = [...imagenesSubir];
            nuevasImagenesSubir.splice(index, 1);
            setImagenesSubir(nuevasImagenesSubir);
        } catch (error) {
            console.error('Error al eliminar imagen:', error);
            showSnackbar('Error al eliminar la imagen', 'error');
        }
    };

    const bicicletasMostradas = tipoBicicleta === 'venta' ? bicicletasVenta : bicicletasArriendo;
    const totalBicicletas = tipoBicicleta === 'venta' ? bicicletasVenta.length : bicicletasArriendo.length;

    const bicicletasFiltradas = bicicletasMostradas.filter(b =>
        b.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        b.id.toString().toLowerCase().includes(busqueda.toLowerCase())
    );

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0
        }).format(value);
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* Header */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3
            }}>
                <Box>
                    <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center' }}>
                        <BikeIcon sx={{ mr: 1 }} /> Gestión de Bicicletas
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Total: {totalBicicletas} bicicletas | Mostrando: {bicicletasFiltradas.length}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 180 }}>
                        <InputLabel id="tipo-bicicleta-label">Tipo de bicicleta</InputLabel>
                        <Select
                            labelId="tipo-bicicleta-label"
                            value={tipoBicicleta}
                            onChange={(e) => setTipoBicicleta(e.target.value)}
                            label="Tipo de bicicleta"
                        >
                            <MenuItem value="venta">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <SellIcon fontSize="small" /> Bicicletas Venta
                                </Box>
                            </MenuItem>
                            <MenuItem value="arriendo">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <RentIcon fontSize="small" /> Bicicletas Arriendo
                                </Box>
                            </MenuItem>
                        </Select>
                    </FormControl>

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleNuevaBicicleta}
                        sx={{ height: '40px' }}
                    >
                        Agregar Bicicleta
                    </Button>
                </Box>
            </Box>

            {/* Barra de búsqueda */}
            <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid #e0e0e0' }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder={`Buscar bicicletas ${tipoBicicleta === 'venta' ? 'de venta' : 'de arriendo'}...`}
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    InputProps={{
                        startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                    }}
                    size="small"
                />
            </Paper>

            {/* Tabla de bicicletas */}
            <Paper elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                                {tipoBicicleta === 'venta' ? (
                                    <>
                                        <TableCell sx={{ fontWeight: 'bold' }} align="right">Precio</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }} align="right">Stock</TableCell>
                                    </>
                                ) : (
                                    <>
                                        <TableCell sx={{ fontWeight: 'bold' }} align="right">Tarifa Diaria</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }} align="right">Valor Garantia</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }} align="center">Disponible</TableCell>
                                    </>
                                )}
                                <TableCell sx={{ fontWeight: 'bold' }} align="center">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {bicicletasFiltradas.length > 0 ? (
                                bicicletasFiltradas.map((bicicleta) => (
                                    <TableRow key={bicicleta.id} hover>
                                        <TableCell>{bicicleta.id}</TableCell>
                                        <TableCell>{bicicleta.nombre}</TableCell>

                                        {tipoBicicleta === 'venta' ? (
                                            <>
                                                <TableCell align="right">
                                                    {formatCurrency(bicicleta.precio)}
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Box
                                                        component="span"
                                                        sx={{
                                                            px: 1,
                                                            py: 0.5,
                                                            borderRadius: 1,
                                                            bgcolor: bicicleta.stock < 3 ? '#ffebee' : '#e8f5e9',
                                                            color: bicicleta.stock < 3 ? '#c62828' : '#2e7d32'
                                                        }}
                                                    >
                                                        {bicicleta.stock}
                                                    </Box>
                                                </TableCell>
                                            </>
                                        ) : (
                                            <>
                                                <TableCell align="right">
                                                    {formatCurrency(bicicleta.tarifaDiaria)}
                                                </TableCell>
                                                <TableCell align="right">
                                                    {formatCurrency(bicicleta.valorGarantia)}  {/* Nueva columna */}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        label={bicicleta.disponible ? 'Disponible' : 'No disponible'}
                                                        color={bicicleta.disponible ? 'success' : 'error'}
                                                        size="small"
                                                    />
                                                </TableCell>
                                            </>
                                        )}

                                        <TableCell align="center">
                                            <Tooltip title="Editar">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleEditarBicicleta(bicicleta)}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Eliminar">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => setBicicletaEliminar(bicicleta)}
                                                    sx={{ color: '#f44336' }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={tipoBicicleta === 'venta' ? 6 : 6} align="center" sx={{ py: 3 }}>
                                        <Typography variant="body1" color="text.secondary">
                                            No se encontraron bicicletas
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Drawer para Edición/Creación */}
            <Drawer
                anchor="right"
                open={openDrawer}
                onClose={() => {
                    setOpenDrawer(false);
                    setBicicletaEditar(null);
                    setIdDisponible(null);
                    setValidandoId(false);
                    setImagenesPreview([]);
                    setImagenesSubir([]);
                }}
                PaperProps={{
                    sx: {
                        width: '600px',
                        p: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100vh',
                        overflow: 'hidden'
                    }
                }}
            >
                {/* Header */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                    flexShrink: 0
                }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {nuevaBicicleta ? 'Nueva Bicicleta' : 'Editar Bicicleta'}
                    </Typography>
                    <IconButton onClick={() => setOpenDrawer(false)}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                {/* Contenido principal con scroll */}
                <Box sx={{
                    flexGrow: 1,
                    overflowY: 'auto',
                    mb: 4,
                    '& > div:not(:last-child)': {
                        borderBottom: '1px solid #e0e0e0',
                        pb: 3,
                        mb: 3
                    }
                }}>
                    {/* Sección 1: Tipo de bicicleta */}
                    <Box>
                        <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
                            Tipo de bicicleta
                        </Typography>
                        <FormControl fullWidth size="small">
                            <InputLabel>Tipo de bicicleta</InputLabel>
                            <Select
                                value={formTipoBicicleta}
                                onChange={(e) => setFormTipoBicicleta(e.target.value)}
                                label="Tipo de bicicleta"
                                disabled={!nuevaBicicleta}
                            >
                                <MenuItem value="venta">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <SellIcon fontSize="small" /> Venta
                                    </Box>
                                </MenuItem>
                                <MenuItem value="arriendo">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <RentIcon fontSize="small" /> Arriendo
                                    </Box>
                                </MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    {/* Sección 2: ID y Nombre */}
                    <Box>
                        <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
                            Información básica
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Box sx={{ flex: '0 0 40%' }}>
                                <TextField
                                    label="ID"
                                    fullWidth
                                    size="small"
                                    value={bicicletaEditar?.id || ''}
                                    onChange={e => {
                                        setBicicletaEditar({ ...bicicletaEditar, id: e.target.value });
                                        verificarDisponibilidadId(e.target.value);
                                    }}
                                    disabled={!nuevaBicicleta}
                                />
                                {idDisponible !== null && (
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            mt: 0.5,
                                            color: idDisponible ? 'success.main' : 'error.main'
                                        }}
                                    >
                                        {validandoId ? (
                                            <>Validando ID...</>
                                        ) : (
                                            <>
                                                {idDisponible ? (
                                                    <>
                                                        <CheckCircleIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                                                        ID disponible
                                                    </>
                                                ) : (
                                                    <>
                                                        <ErrorIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                                                        ID no disponible
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </Typography>
                                )}
                            </Box>
                            <Box sx={{ flex: '0 0 55%' }}>
                                <TextField
                                    label="Nombre"
                                    fullWidth
                                    size="small"
                                    value={bicicletaEditar?.nombre || ''}
                                    onChange={e => setBicicletaEditar({ ...bicicletaEditar, nombre: e.target.value })}
                                    error={!!formErrors.nombre}
                                    helperText={formErrors.nombre}
                                />
                            </Box>
                        </Box>
                    </Box>


                    {/* Sección 3: Descripción */}
                    <Box>
                        <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
                            Descripción
                        </Typography>
                        <TextField
                            label="Descripción"
                            fullWidth
                            multiline
                            rows={3}
                            size="small"
                            value={bicicletaEditar?.descripcion || ''}
                            onChange={e => setBicicletaEditar({ ...bicicletaEditar, descripcion: e.target.value })}
                        />
                    </Box>

                    {/* Sección 4: Campos específicos */}
                    {formTipoBicicleta === 'venta' ? (
                        <Box>
                            <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
                                Detalles de venta
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Precio"
                                        type="number"
                                        fullWidth
                                        size="small"
                                        value={bicicletaEditar?.precio || ''}
                                        onChange={e => setBicicletaEditar({ ...bicicletaEditar, precio: parseInt(e.target.value) || 0 })}
                                        error={!!formErrors.precio}
                                        helperText={formErrors.precio}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Stock"
                                        type="number"
                                        fullWidth
                                        size="small"
                                        value={bicicletaEditar?.stock || ''}
                                        onChange={e => setBicicletaEditar({ ...bicicletaEditar, stock: parseInt(e.target.value) || 0 })}
                                        error={!!formErrors.stock}
                                        helperText={formErrors.stock}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    ) : (
                        <Box>
                            <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
                                Detalles de arriendo
                            </Typography>
                            <Grid container spacing={2}>
                                {/* Campo existente: Tarifa Diaria */}
                                <Grid item xs={6}>
                                    <TextField
                                        label="Tarifa Diaria"
                                        type="number"
                                        fullWidth
                                        size="small"
                                        value={bicicletaEditar?.tarifaDiaria || ''}
                                        onChange={e => setBicicletaEditar({
                                            ...bicicletaEditar,
                                            tarifaDiaria: parseInt(e.target.value) || 0
                                        })}
                                        error={!!formErrors.tarifaDiaria}
                                        helperText={formErrors.tarifaDiaria}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                        }}
                                    />
                                </Grid>

                                {/* Campo existente: Disponibilidad */}
                                <Grid item xs={6}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Disponibilidad</InputLabel>
                                        <Select
                                            value={bicicletaEditar?.disponible ? 'true' : 'false'}
                                            onChange={e => setBicicletaEditar({
                                                ...bicicletaEditar,
                                                disponible: e.target.value === 'true'
                                            })}
                                            label="Disponibilidad"
                                        >
                                            <MenuItem value="true">Disponible</MenuItem>
                                            <MenuItem value="false">No disponible</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {/* Nuevo campo: Valor Garantía */}
                                <Grid item xs={6}>
                                    <TextField
                                        label="Valor Garantía (CLP)"
                                        type="number"
                                        fullWidth
                                        size="small"
                                        value={bicicletaEditar?.valorGarantia || ''}
                                        onChange={e => setBicicletaEditar({
                                            ...bicicletaEditar,
                                            valorGarantia: parseInt(e.target.value) || 0
                                        })}
                                        error={!!formErrors.valorGarantia}
                                        helperText={formErrors.valorGarantia}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    )}

                    {/* Sección 5: Imágenes (solo para venta) */}
                    {formTipoBicicleta === 'venta' && (
                        <Box>
                            <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
                                Imágenes
                            </Typography>

                            <Button
                                variant="outlined"
                                component="label"
                                startIcon={<UploadIcon />}
                                fullWidth
                                sx={{ mb: 3 }}
                            >
                                Subir imágenes
                                <input
                                    type="file"
                                    hidden
                                    multiple
                                    accept="image/*"
                                    onChange={handleImagenChange}
                                />
                            </Button>

                            {/* Preview de imágenes mejorado */}
                            {imagenesPreview.length > 0 && (
                                <Box sx={{
                                    border: '1px dashed #e0e0e0',
                                    borderRadius: 1,
                                    p: 2,
                                    mb: 2
                                }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        Vista previa de imágenes ({imagenesPreview.length})
                                    </Typography>
                                    <Grid container spacing={1}>
                                        {imagenesPreview.map((img, index) => (
                                            <Grid item xs={4} key={index}>
                                                <Box sx={{
                                                    position: 'relative',
                                                    borderRadius: 1,
                                                    overflow: 'hidden',
                                                    height: 100
                                                }}>
                                                    <img
                                                        src={img}
                                                        alt={`Preview ${index}`}
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'cover'
                                                        }}
                                                    />
                                                    <IconButton
                                                        size="small"
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 4,
                                                            right: 4,
                                                            backgroundColor: 'rgba(0,0,0,0.5)',
                                                            color: 'white',
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(0,0,0,0.7)'
                                                            }
                                                        }}
                                                        onClick={() => eliminarImagenPreview(index)}
                                                    >
                                                        <CloseIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            )}
                        </Box>
                    )}
                </Box>

                {/* Botones de acción */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 2,
                    pt: 2,
                    borderTop: '1px solid #e0e0e0',
                    pb: 4,
                    flexShrink: 0
                }}>
                    <Button
                        variant="outlined"
                        onClick={() => {
                            setOpenDrawer(false);
                            setBicicletaEditar(null);
                            setImagenesPreview([]);
                            setImagenesSubir([]);
                        }}
                        sx={{ width: '120px' }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleGuardarEdicion}
                        sx={{ width: '120px' }}
                    >
                        {nuevaBicicleta ? 'Crear' : 'Guardar'}
                    </Button>
                </Box>
            </Drawer>

            {/* Modal Eliminación */}
            <Dialog open={!!bicicletaEliminar} onClose={() => setBicicletaEliminar(null)}>
                <DialogTitle sx={{ borderBottom: '1px solid #e0e0e0' }}>
                    Confirmar eliminación
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        Esta acción no se puede deshacer
                    </Alert>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Bicicleta:</strong> {bicicletaEliminar?.nombre}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>ID:</strong> {bicicletaEliminar?.id}
                    </Typography>
                    <Typography variant="body1">
                        <strong>Tipo:</strong> {bicicletaEliminar?.tarifaDiaria ? 'Arriendo' : 'Venta'}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ borderTop: '1px solid #e0e0e0', p: 2 }}>
                    <Button onClick={() => setBicicletaEliminar(null)}>Cancelar</Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleEliminar}
                        startIcon={<DeleteIcon />}
                    >
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Notificación */}
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