import { Routes, Route } from 'react-router-dom';
import { Container } from '@mui/material';
import Catalogo from '../views/Cliente/Catalogo';
import Carrito from '../views/Cliente/Carrito';
import GestionCuenta from '../views/Cliente/GestionCuenta';
import Reparaciones from '../views/Cliente/Reparaciones';
import HistorialView from '../views/Cliente/HistorialView';

export default function ClienteRoutes() {
    return (
        <Container
            sx={{
                mx: "8%",
                maxWidth: '84% !important'
            }}
        >
            <Routes>
                <Route path="shop" element={<Catalogo />} />
                <Route path="cart" element={<Carrito />} />
                <Route path="reparacion" element={<Reparaciones />} />
                <Route path="cuenta" element={<GestionCuenta />} />
                <Route path="historial" element={<HistorialView />} />
            </Routes>
        </Container>
    );
}