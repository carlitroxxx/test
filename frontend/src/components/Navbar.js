import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Button, Box, Menu, MenuItem, Typography, Avatar } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const { user, logout } = useAuth();
    const [historialAnchorEl, setHistorialAnchorEl] = useState(null);

    const handleHistorialClick = (event) => {
        setHistorialAnchorEl(event.currentTarget);
    };

    const handleHistorialClose = () => {
        setHistorialAnchorEl(null);
    };

    const handleHistorialOptionClick = (tipo) => {
        navigate('/cliente/historial', { state: { tipo } });
        handleHistorialClose();
    };

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        handleMenuClose();
        navigate('/login');
    };

    if (!user) {
        return (
            <AppBar position="static">
                <Toolbar>
                    <Box sx={{ flexGrow: 1 }}>
                        <Button color="inherit" component={Link} to="/">Inicio</Button>
                        <Button color="inherit" component={Link} to="/login/emp">EMPLEADO</Button>
                    </Box>
                    <Box>
                        <Button color="inherit" component={Link} to="/login">Login</Button>
                        <Button color="inherit" component={Link} to="/registro">Registro</Button>
                    </Box>
                </Toolbar>
            </AppBar>
        );
    }

    // Render para cliente
    if (user.role === 'CLIENTE') {
        return (
            <AppBar position="static">
                <Toolbar>
                    <Box sx={{ flexGrow: 1 }} display="flex" gap={2}>
                        <Button color="inherit" component={Link} to="/cliente/shop">Catálogo</Button>
                        <Button color="inherit" component={Link} to="/cliente/cart">Carrito</Button>
                        <Button color="inherit" component={Link} to="/cliente/reparacion">Reparaciones</Button>
                        <Button color="inherit" component={Link} to="/cliente/cuenta">Cuenta</Button>

                        <Button color="inherit" onClick={handleHistorialClick}>Historial</Button>
                        <Menu
                            anchorEl={historialAnchorEl}
                            open={Boolean(historialAnchorEl)}
                            onClose={handleHistorialClose}
                        >
                            <MenuItem onClick={() => handleHistorialOptionClick('compras')}>Historial Compras</MenuItem>
                            <MenuItem onClick={() => handleHistorialOptionClick('arriendos')}>Historial Arriendos</MenuItem>
                            <MenuItem onClick={() => handleHistorialOptionClick('reparaciones')}>Historial Reparaciones</MenuItem>
                        </Menu>
                    </Box>
                    <Box>
                        <Button
                            color="inherit"
                            onClick={handleMenuClick}
                            startIcon={<Avatar sx={{ width: 24, height: 24 }}>{user.nombre.charAt(0)}</Avatar>}
                        >
                            {user.nombre}
                        </Button>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                        >
                            <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>
        );
    }

    // Render para inventario
    if (user.role === 'INVENTARIO') {
        return (
            <AppBar position="static">
                <Toolbar>
                    <Box sx={{ flexGrow: 1 }} display="flex" gap={2}>
                        <Button color="inherit" component={Link} to="/inventario/recepcion">Bicicletas</Button>
                        <Button color="inherit" component={Link} to="/inventario/ingresos">Componentes</Button>
                    </Box>
                    <Box>
                        <Button
                            color="inherit"
                            onClick={handleMenuClick}
                            startIcon={<Avatar sx={{ width: 24, height: 24 }}>{user.nombre.charAt(0)}</Avatar>}
                        >
                            {user.nombre}
                        </Button>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                        >
                            <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>
        );
    }
    if(user.role === 'SUPERVISOR'){
        return(
            <AppBar position="static">
                <Toolbar>
                    <Box sx={{ flexGrow: 1 }} display="flex" gap={2}>
                        <Button color="inherit" component={Link} to="/supervisor/registro">CREAR USUARIOS</Button>
                    </Box>
                    <Box>
                        <Button
                            color="inherit"
                            onClick={handleMenuClick}
                            startIcon={<Avatar sx={{ width: 24, height: 24 }}>{user.nombre.charAt(0)}</Avatar>}
                        >
                            {user.nombre}
                        </Button>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                        >
                            <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>
        );
    }
    // Render para otros roles (puedes personalizar según necesites)
    return (
        <AppBar position="static">
            <Toolbar>
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6">Panel de {user.role.toLowerCase()}</Typography>
                </Box>
                <Box>
                    <Button
                        color="inherit"
                        onClick={handleMenuClick}
                        startIcon={<Avatar sx={{ width: 24, height: 24 }}>{user.nombre.charAt(0)}</Avatar>}
                    >
                        {user.nombre}
                    </Button>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                    >
                        <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
}