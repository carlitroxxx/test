import React, { useState } from 'react';
import {
    Container,
    Typography,
    TextField,
    Button,
    Box,
    Grid,
    InputAdornment,
    MenuItem,
    CircularProgress,
    Snackbar,
    Alert,
    Paper,
    Divider,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    DateRange,
    AccessTime,
    Description,
    DirectionsBike,
    Build,
    ContactPhone
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    borderRadius: '12px',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(2)
    }
}));

export default function Reparaciones() {
    const [form, setForm] = useState({
        fecha: '',
        hora: '',
        descripcion: '',
        tipoReparacion: '',
        telefono: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const tiposReparacion = [
        'Ajuste de frenos',
        'Ajuste de cambios',
        'Reparación de pinchazo',
        'Centrado de ruedas',
        'Cambio de cadena',
        'Ajuste de suspensión',
        'Limpieza y lubricación',
        'Revisión general',
        'Otro'
    ];

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Validaciones
        if (!form.fecha || !form.hora || !form.descripcion || !form.tipoReparacion) {
            setSnackbar({ open: true, message: 'Por favor complete todos los campos requeridos', severity: 'error' });
            setIsLoading(false);
            return;
        }

        // Simulación de envío a API
        setTimeout(() => {
            console.log('Datos enviados:', form);
            setSnackbar({ open: true, message: 'Reparación agendada con éxito! Nos contactaremos para confirmar.', severity: 'success' });
            setIsLoading(false);
            // Reset form
            setForm({
                fecha: '',
                hora: '',
                descripcion: '',
                tipoReparacion: '',
                telefono: ''
            });
        }, 2000);
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4, mx: 'none' }}>
            <StyledPaper elevation={3}>
                <Box display="flex" alignItems="center" mb={3} flexDirection={isSmallScreen ? 'column' : 'row'} textAlign={isSmallScreen ? 'center' : 'left'}>
                    <DirectionsBike color="primary" sx={{ fontSize: 40, mr: isSmallScreen ? 0 : 2, mb: isSmallScreen ? 1 : 0 }} />
                    <Typography variant="h4" component="h1" color="primary">
                        Agendar Reparación de Bicicleta
                    </Typography>
                </Box>

                <form onSubmit={handleSubmit}>
                    {/* Primera fila - Campos superiores */}
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Fecha de reparación *"
                                type="date"
                                name="fecha"
                                InputLabelProps={{ shrink: true }}
                                value={form.fecha}
                                onChange={handleChange}
                                required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <DateRange color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={4} sx={{
                            width: isSmallScreen ? '100%' : '13%',
                            minWidth: isSmallScreen ? '100%' : '120px'
                        }}>
                            <TextField
                                fullWidth
                                label="Hora disponible *"
                                type="time"
                                name="hora"
                                InputLabelProps={{ shrink: true }}
                                value={form.hora}
                                onChange={handleChange}
                                required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <AccessTime color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={4} sx={{
                            width: isSmallScreen ? '100%' : '27%',
                            minWidth: isSmallScreen ? '100%' : '250px'
                        }}>
                            <TextField
                                select
                                fullWidth
                                label="Tipo de reparación *"
                                name="tipoReparacion"
                                value={form.tipoReparacion}
                                onChange={handleChange}
                                required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Build color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            >
                                {tiposReparacion.map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                    </Grid>

                    {/* Campo de descripción */}
                    <TextField
                        fullWidth
                        label="Descripción detallada del problema *"
                        name="descripcion"
                        multiline
                        rows={isSmallScreen ? 3 : 4}
                        value={form.descripcion}
                        onChange={handleChange}
                        required
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Description color="action" />
                                </InputAdornment>
                            ),
                        }}
                        placeholder="Describa con detalle el problema que presenta su bicicleta..."
                        sx={{ mb: 3 }}
                    />

                    <Divider sx={{ my: 3 }} />

                    {/* Segunda fila - Contacto y botón con posición final */}
                    <Grid container spacing={3} alignItems="flex-start" justifyContent={"space-between"}>
                        <Grid item xs={12} sm={8}>
                            <TextField
                                fullWidth
                                label="Teléfono de contacto"
                                name="telefono"
                                type="tel"
                                value={form.telefono}
                                onChange={handleChange}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <ContactPhone color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                                helperText="Opcional, para contactarlo si hay dudas"
                            />
                        </Grid>

                        <Grid item xs={12} sm={4} sx={{
                            display: 'flex',
                            justifyContent: { xs: 'flex-end', sm: 'flex-end' },
                            alignItems: 'flex-end',
                            mt: { xs: 2, sm: 0 }
                        }}>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                fullWidth={isSmallScreen}
                                sx={{
                                    height: '56px',
                                    minWidth: isSmallScreen ? '100%' : '200px',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                                    },
                                    transition: 'all 0.3s ease'


                                }}
                                disabled={isLoading}
                                startIcon={isLoading ? <CircularProgress size={20} /> : null}
                            >
                                {isLoading ? 'Agendando...' : 'SOLICITAR REPARACIÓN'}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </StyledPaper>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}