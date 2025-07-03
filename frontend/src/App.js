import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ClienteRoutes from './routes/ClienteRoutes';
import Navbar from './components/Navbar';
import InventarioRoutes from "./routes/InventarioRoutes";
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import {AuthProvider, useAuth} from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import {CartProvider} from "./context/CartContext";
import SupervisorRoutes from "./routes/SupervisorRoutes";
import EmployeeLoginPage from "./components/EmployeeLoginPage";
import ArriendoForm from "./views/Vendedor/ArriendoForm";
import ReparacionesList from "./views/Tecnico/ReparacionesList";

function App() {
    return (
        <Router>
            <AuthProvider>
                <CartProvider>
                <Navbar />
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/registro" element={<RegisterPage />} />
                    <Route path="login/emp" element={<EmployeeLoginPage />} />
                    <Route path="/vendedor/arriendo" element={<ArriendoForm/>} />
                    <Route path="/tecnico/reparaciones" element={<ReparacionesList />} />
                    <Route path="/supervisor/*" element={
                        <PrivateRoute allowedRoles={['SUPERVISOR']}>
                            <SupervisorRoutes />
                        </PrivateRoute>
                    } />
                    <Route path="/cliente/*" element={
                        <PrivateRoute allowedRoles={['CLIENTE']}>
                            <ClienteRoutes />
                        </PrivateRoute>
                    } />
                    <Route path="/inventario/*" element={
                        <PrivateRoute allowedRoles={['INVENTARIO']}>
                            <InventarioRoutes />
                        </PrivateRoute>
                    } />

                    {/* Redirigir según el rol cuando se accede a la raíz */}
                    <Route path="/" element={<HomeRedirect />} />
                </Routes>
                </CartProvider>
            </AuthProvider>
        </Router>
    );
}

function HomeRedirect() {
    const { user } = useAuth();

    if (user) {
        if (user.role === 'CLIENTE') {
            return <Navigate to="/cliente/shop" replace />;
        } else {
            return <Navigate to={`/${user.role.toLowerCase()}/dashboard`} replace />;
        }
    }

    return <Navigate to="/login" replace />;
}

export default App;