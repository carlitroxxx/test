import React, { useState } from 'react';
import { validateRut, formatRut } from './rutUtils';
import { Container, TextField, Button, Typography, Box, Paper, Avatar } from '@mui/material';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rut, setRut] = useState('');
    const [rutError, setRutError] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();
    const [emailError, setEmailError] = useState('');

    const handleRutChange = (e) => {
        const rawValue = e.target.value;
        const formatted = formatRut(rawValue);
        setRut(formatted);

        // Validar solo cuando el RUT está completo
        if (formatted.includes('-')) {
            setRutError(validateRut(formatted) ? '' : 'RUT inválido');
        } else {
            setRutError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEmailError('');
        setError('');
        setRutError('');

        if (!validateRut(rut)) {
            setRutError('Por favor ingrese un RUT válido');
            return;
        }
        if (!email.includes('@') || !email.includes('.')) {
            setEmailError('Ingrese un correo electrónico válido');
            return;
        }
        try {
            await register(nombre, email, password, rut);
            setEmailError('');
            setError('');
            setRutError('');
        } catch (error) {
            switch(error.message) {
                case 'EMAIL_EXISTS':
                    setError('El correo electrónico ya está en uso');
                    break;
                case 'RUT_EXISTS':
                    setError('El RUT ya está registrado');
                    break;
                case 'RUT_REQUIRED':
                    setRutError('El RUT es obligatorio');
                    break;
                case 'EMAIL_INVALID':
                    setEmailError('Ingrese un correo electrónico válido');
                    break;
                default:
                    setError('Error al registrarse. Por favor intente nuevamente');
            }
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
                        <PersonAddIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Registro de Cliente
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Nombre completo"
                            autoComplete="name"
                            autoFocus
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="RUT (Ej: 12.345.678-9)"
                            value={rut}
                            onChange={handleRutChange}
                            error={!!rutError}
                            helperText={rutError}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Correo electrónico"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            error={!!emailError}
                            helperText={emailError}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Contraseña"
                            type="password"
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {error && (
                            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                                {error}
                            </Typography>
                        )}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={!!rutError}
                        >
                            Registrarse
                        </Button>
                        <Box sx={{ textAlign: 'center' }}>
                            <Button
                                variant="text"
                                onClick={() => navigate('/login')}
                                sx={{ textTransform: 'none' }}
                            >
                                ¿Ya tienes cuenta? Inicia sesión
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
}