import { Routes, Route } from 'react-router-dom';
import {Container, Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import PanelUsuarios from "../views/Supervisor/PanelUsuarios";
import EmployeeRegisterPage from "../components/EmployeeRegisterPage";
import React from "react";
import EmployeeLoginPage from "../components/EmployeeLoginPage";



export default function SupervisorRoutes() {
    const { user } = useAuth();

    if (user.role === 'INVENTARIO') {
        return null;
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 4 , mx: '10%'}}>
            <Routes>
                <Route path="panel" element={<PanelUsuarios />} />
                <Route path="registro" element={<EmployeeRegisterPage />} />
            </Routes>
        </Container>
    );
}