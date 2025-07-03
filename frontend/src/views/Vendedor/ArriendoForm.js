import React, { useState, useEffect } from 'react';
import {
    TextField, Button, MenuItem, Grid, Typography, Paper, Divider,
    Snackbar, Alert, CircularProgress, Autocomplete
} from '@mui/material';
import axios from 'axios';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import esLocale from 'date-fns/locale/es';

const formasPago = ['Efectivo', 'Tarjeta de Crédito', 'Transferencia', 'Otro'];

const ArriendoForm = () => {
    const [form, setForm] = useState({
        clienteNombre: '',
        clienteRut: '',
        clienteEmail: '',
        clienteTelefono: '',
        bicicleta: null,
        fechaInicio: null,
        fechaFin: null,
        formaPago: '',
        deposito: '',
        precioDia: '',
        diasArriendo: 0,
        total: 0
    });

    const [bicicletas, setBicicletas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ open: false, success: true, message: '' });
    const [errors, setErrors] = useState({});
    const [userSearchLoading, setUserSearchLoading] = useState(false);
    const [isExistingUser, setIsExistingUser] = useState(false);

    // Cargar bicicletas disponibles
    useEffect(() => {
        const fetchBicicletas = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/inventario/arriendo');
                setBicicletas(response.data);
            } catch (error) {
                setAlert({
                    open: true,
                    success: false,
                    message: 'Error al cargar bicicletas: ' + (error.response?.data?.message || error.message)
                });
            }
        };
        fetchBicicletas();
    }, []);

    // Buscar usuario por RUT (versión básica)
    const buscarUsuarioPorRut = async (rut) => {
        if (!rut || rut.length < 4) return;

        setUserSearchLoading(true);
        try {
            const response = await axios.get(`http://localhost:8080/api/auth/buscar-por-rut?rut=${rut}`);
            if (response.data) {
                setForm({
                    ...form,
                    clienteNombre: response.data.nombre || '',
                    clienteEmail: response.data.email || '',
                    clienteTelefono: response.data.telefono || '',
                });
                setIsExistingUser(true);
                setAlert({
                    open: true,
                    success: true,
                    message: 'Usuario encontrado. Datos cargados automáticamente.'
                });
            }
        } catch (error) {
            setIsExistingUser(false);
            if (error.response?.status !== 404) {
                setAlert({
                    open: true,
                    success: false,
                    message: 'Error al buscar usuario: ' + (error.response?.data?.message || error.message)
                });
            }
        } finally {
            setUserSearchLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleRutBlur = () => {
        buscarUsuarioPorRut(form.clienteRut);
    };
    const handleBicicletaChange = (event, newValue) => {
        setForm({
            ...form,
            bicicleta: newValue,
            deposito: newValue?.deposito || '',
            precioDia: newValue?.precioDia || ''
        });
    };

    const calcularTotal = () => {
        if (form.fechaInicio && form.fechaFin && form.precioDia) {
            const diffTime = Math.abs(new Date(form.fechaFin) - new Date(form.fechaInicio));
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            const total = diffDays * parseFloat(form.precioDia || 0);
            setForm(prev => ({ ...prev, diasArriendo: diffDays, total }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!form.clienteNombre) newErrors.clienteNombre = 'Nombre es requerido';
        if (!form.clienteRut) newErrors.clienteRut = 'RUT es requerido';
        if (!form.bicicleta) newErrors.bicicleta = 'Bicicleta es requerida';
        if (!form.fechaInicio) newErrors.fechaInicio = 'Fecha inicio es requerida';
        if (!form.fechaFin) newErrors.fechaFin = 'Fecha fin es requerida';
        if (form.fechaFin && form.fechaInicio && new Date(form.fechaFin) < new Date(form.fechaInicio)) {
            newErrors.fechaFin = 'Fecha fin debe ser posterior a fecha inicio';
        }
        if (!form.formaPago) newErrors.formaPago = 'Forma de pago es requerida';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const resetForm = () => {
        setForm({
            clienteNombre: '',
            clienteRut: '',
            clienteEmail: '',
            clienteTelefono: '',
            bicicleta: null,
            fechaInicio: null,
            fechaFin: null,
            formaPago: '',
            deposito: '',
            precioDia: '',
            diasArriendo: 0,
            total: 0
        });
        setIsExistingUser(false);
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setLoading(true);

        try {
            const dataToSend = {
                bicicletaId: form.bicicleta.id,
                clienteNombre: form.clienteNombre,
                clienteRut: form.clienteRut,
                clienteEmail: form.clienteEmail,
                clienteTelefono: form.clienteTelefono,
                fechaInicio: form.fechaInicio.toISOString().split('T')[0],
                fechaFin: form.fechaFin.toISOString().split('T')[0],
                formaPago: form.formaPago,
                deposito: form.deposito,
                precioDia: form.precioDia,
                diasArriendo: form.diasArriendo,
                total: form.total,
                esClienteRegistrado: isExistingUser
            };

            await axios.post('http://localhost:8084/api/arriendos', dataToSend);
            setAlert({
                open: true,
                success: true,
                message: 'Arriendo registrado correctamente.'
            });
            resetForm();
        } catch (error) {
            setAlert({
                open: true,
                success: false,
                message: `Error: ${error.response?.data?.message || error.message}`
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={esLocale}>
            <Paper elevation={3} sx={{ maxWidth: 1000, mx: 'auto', mt: 4, p: 4 }}>
                <Typography variant="h5" gutterBottom sx={{
                    fontWeight: 'bold',
                    color: 'primary.main',
                    mb: 4,
                    fontSize: '1.8rem'
                }}>
                    Registrar Arriendo de Bicicleta
                </Typography>

                {/* Campo RUT con búsqueda */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="RUT"
                            name="clienteRut"
                            value={form.clienteRut}
                            onChange={handleChange}
                            onBlur={handleRutBlur}
                            error={!!errors.clienteRut}
                            helperText={errors.clienteRut || (userSearchLoading ? 'Buscando usuario...' : '')}
                            size="medium"
                            InputProps={{
                                endAdornment: userSearchLoading ? <CircularProgress size={20} /> : null
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    height: '56px',
                                    fontSize: '1.1rem'
                                }
                            }}
                        />
                    </Grid>

                    {/* Campos bloqueables */}
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Email"
                            name="clienteEmail"
                            value={form.clienteEmail}
                            onChange={handleChange}
                            type="email"
                            disabled={isExistingUser}
                            size="medium"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    height: '56px',
                                    fontSize: '1.1rem',
                                    backgroundColor: isExistingUser ? 'action.hover' : 'background.paper'
                                }
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Teléfono"
                            name="clienteTelefono"
                            value={form.clienteTelefono}
                            onChange={handleChange}
                            disabled={isExistingUser}
                            size="medium"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    height: '56px',
                                    fontSize: '1.1rem',
                                    backgroundColor: isExistingUser ? 'action.hover' : 'background.paper'
                                }
                            }}
                        />
                    </Grid>
                </Grid>

                {/* Nombre Completo */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Nombre Completo"
                            name="clienteNombre"
                            value={form.clienteNombre}
                            onChange={handleChange}
                            error={!!errors.clienteNombre}
                            helperText={errors.clienteNombre}
                            disabled={isExistingUser}
                            size="medium"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    height: '56px',
                                    fontSize: '1.1rem',
                                    backgroundColor: isExistingUser ? 'action.hover' : 'background.paper'
                                },
                                minWidth: '516px',
                            }}
                        />
                    </Grid>
                </Grid>

                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={3}>
                        <DatePicker
                            label="Fecha Inicio"
                            value={form.fechaInicio}
                            onChange={(date) => {
                                setForm({ ...form, fechaInicio: date });
                                calcularTotal();
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    fullWidth
                                    error={!!errors.fechaInicio}
                                    helperText={errors.fechaInicio}
                                    size="medium"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            height: '56px',
                                            fontSize: '1.1rem'
                                        }
                                    }}
                                />
                            )}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <DatePicker
                            label="Fecha Fin"
                            value={form.fechaFin}
                            onChange={(date) => {
                                setForm({ ...form, fechaFin: date });
                                calcularTotal();
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    fullWidth
                                    error={!!errors.fechaFin}
                                    helperText={errors.fechaFin}
                                    size="medium"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            height: '56px',
                                            fontSize: '1.1rem'
                                        }
                                    }}
                                />
                            )}
                            minDate={form.fechaInicio}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            select
                            fullWidth
                            label="Método de Pago"
                            name="formaPago"
                            value={form.formaPago}
                            onChange={handleChange}
                            error={!!errors.formaPago}
                            helperText={errors.formaPago}
                            size="medium"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    height: '56px',
                                    fontSize: '1.1rem',
                                },
                                minWidth: '200px',
                            }}
                        >
                            {formasPago.map((forma) => (
                                <MenuItem key={forma} value={forma}>{forma}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                </Grid>

                {/* Cuarta fila: BICICLETA | DEPÓSITO | PRECIO DÍA */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={5}>
                        <Autocomplete
                            options={bicicletas}
                            getOptionLabel={(option) => `${option.nombre} ($${option.tarifaDiaria?.toLocaleString('es-CL') || 0}/día)`}
                            value={form.bicicleta}
                            onChange={(event, newValue) => {
                                setForm({
                                    ...form,
                                    bicicleta: newValue,
                                    deposito: newValue?.valorGarantia || '',
                                    precioDia: newValue?.tarifaDiaria || ''
                                });
                            }}
                            sx={{ minWidth: '516px' }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Bicicleta"
                                    error={!!errors.bicicleta}
                                    helperText={errors.bicicleta}
                                    size="medium"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            height: '56px',
                                            fontSize: '1.1rem',
                                        },
                                    }}
                                />
                            )}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            label="Depósito Garantía ($)"
                            name="deposito"
                            value={form.deposito ? `$${form.deposito.toLocaleString('es-CL')}` : ''}
                            InputProps={{ readOnly: true }}
                            size="medium"
                            sx={{
                                maxWidth: '200px',
                                '& .MuiOutlinedInput-root': {
                                    height: '56px',
                                    fontSize: '1.1rem',
                                    backgroundColor: 'action.hover'
                                }
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Precio por día ($)"
                            name="precioDia"
                            value={form.precioDia ? `$${form.precioDia.toLocaleString('es-CL')}` : ''}
                            InputProps={{ readOnly: true }}
                            size="medium"
                            sx={{
                                maxWidth: '200px',
                                '& .MuiOutlinedInput-root': {
                                    height: '56px',
                                    fontSize: '1.1rem',
                                    backgroundColor: 'action.hover'
                                }
                            }}
                        />
                    </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                {/* Resumen */}
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid item xs={6}>
                        <Typography variant="body1" sx={{ fontSize: '1.2rem' }}>
                            <strong>Días de arriendo:</strong> {form.diasArriendo}
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="body1" sx={{
                            textAlign: 'right',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            color: 'primary.main'
                        }}>
                            <strong>Total a pagar:</strong> ${form.total.toLocaleString('es-CL')}
                        </Typography>
                    </Grid>
                </Grid>
                <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={handleSubmit}
                    disabled={loading}
                    sx={{
                        py: 2,
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        letterSpacing: '0.5px'
                    }}
                >
                    {loading ? <CircularProgress size={24} /> : 'Registrar Arriendo'}
                </Button>


                <Snackbar
                    open={alert.open}
                    autoHideDuration={6000}
                    onClose={() => setAlert({ ...alert, open: false })}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <Alert
                        severity={alert.success ? 'success' : 'error'}
                        sx={{ width: '100%', fontSize: '1.1rem' }}
                        onClose={() => setAlert({ ...alert, open: false })}
                    >
                        {alert.message}
                    </Alert>
                </Snackbar>
            </Paper>
        </LocalizationProvider>
    );
};

export default ArriendoForm;