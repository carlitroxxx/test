import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Paper, Avatar } from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validación básica del email
        if (!email.includes('@') || !email.includes('.')) {
            setError('Ingrese un correo electrónico válido');
            return;
        }

        try {
            await login(email, password);
            // Si el login es exitoso, no necesitas hacer nada más aquí
            // porque el AuthContext ya maneja la redirección
        } catch (error) {
            console.error('Login error:', error);

            switch (error.message) {
                case 'USER_DISABLED':
                    setError('Tu cuenta está deshabilitada. Contacta al administrador.');
                    break;
                case 'LOGIN_FAILED':
                    setError('Credenciales incorrectas. Por favor, inténtalo de nuevo.');
                    break;
                case 'No se pudo conectar al servidor':
                    setError('Error de conexión. Por favor, verifica tu conexión a internet.');
                    break;
                default:
                    setError('Error al iniciar sesión. Por favor, inténtalo de nuevo.');
            }
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
                        <LockIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Iniciar sesión como Cliente
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Correo electrónico"
                            autoComplete="email"
                            autoFocus
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Contraseña"
                            type="password"
                            autoComplete="current-password"
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
                        >
                            Iniciar sesión
                        </Button>
                        <Box sx={{ textAlign: 'center' }}>
                            <Button
                                variant="text"
                                onClick={() => navigate('/registro')}
                                sx={{ textTransform: 'none' }}
                            >
                                ¿No tienes cuenta? Regístrate
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
}