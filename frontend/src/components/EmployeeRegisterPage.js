import React, { useState } from 'react';
import { validateRut, formatRut } from './rutUtils';
import {
    Container, TextField, Button, Typography, Box, Paper, Avatar,
    FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from "axios";

export default function EmployeeRegisterPage() {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rut, setRut] = useState('');
    const [rutError, setRutError] = useState('');
    const [role, setRole] = useState('VENDEDOR');
    const [error, setError] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();
    const [emailError, setEmailError] = useState('');

    const handleRutChange = (e) => {
        const rawValue = e.target.value;
        const formatted = formatRut(rawValue);
        setRut(formatted);

        if (formatted.includes('-')) {
            setRutError(validateRut(formatted) ? '' : 'RUT inválido');
        } else {
            setRutError('');
        }
    };

    const handleSubmit = async (e) => {
        setEmailError('');
        e.preventDefault();
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
            const response = await axios.post('http://localhost:8081/api/auth/register/employee', {
                nombre,
                email,
                password,
                role,
                rut
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            alert('Empleado registrado con éxito');
            setEmailError('');
            setError('');
            setRutError('');
            setNombre('');
            setEmail('');
            setPassword('');
            setRut('');
            setRole('VENDEDOR');
        } catch (error) {
            const errorCode = error.response.data?.code;
            switch (errorCode) {
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

    // Solo permitir acceso a supervisores
    if (!user || user.role !== 'SUPERVISOR') {
        navigate('/');
        return null;
    }

    return (
        <Container component="main" maxWidth="xs">
            <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                        <PersonAddIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Registrar Nuevo Empleado
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
                            label="Contraseña temporal"
                            type="password"
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Rol</InputLabel>
                            <Select
                                value={role}
                                label="Rol"
                                onChange={(e) => setRole(e.target.value)}
                            >
                                <MenuItem value="VENDEDOR">Vendedor</MenuItem>
                                <MenuItem value="TECNICO">Técnico</MenuItem>
                                <MenuItem value="INVENTARIO">Inventario</MenuItem>
                            </Select>
                        </FormControl>
                        {error && (
                            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                                {error}
                            </Typography>
                        )}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="secondary"
                            disabled={!!rutError}
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Registrar Empleado
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
}