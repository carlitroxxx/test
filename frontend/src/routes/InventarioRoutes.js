import { Routes, Route, Link } from 'react-router-dom';
import { Box, Button, Container, Typography } from '@mui/material';
import GestionarBicicletas from '../views/Inventario/GestionarBicicletas';
import GestionarComponentes from "../views/Inventario/GestionarComponentes";
import { useAuth } from '../context/AuthContext';



export default function InventarioRoutes() {
    const { user } = useAuth();

    if (!user || user.role !== 'INVENTARIO') {
        return null;
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 4 , mx: '10%'}}>
            <Typography variant="h4" gutterBottom>Panel de Inventario</Typography>
            <Routes>
                <Route path="recepcion" element={<GestionarBicicletas />} />
                <Route path="ingresos" element={<GestionarComponentes />} />
            </Routes>
        </Container>
    );
}