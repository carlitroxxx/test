import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            // 1. Validación básica de entrada
            if (!email || !password) {
                throw new Error('Email y contraseña son requeridos');
            }

            // 2. Petición al backend con manejo de errores mejorado
            const response = await axios.post('http://localhost:8081/api/auth/login', {
                email,
                password
            }, {
                timeout: 10000, // 10 segundos de timeout
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // 3. Validación de la respuesta
            if (!response.data || !response.data.token) {
                throw new Error('Respuesta inválida del servidor');
            }

            const { token, nombre, role, email: userEmail, rut, enabled } = response.data;
            console.log("Datos recibidos: ",{ token, nombre, role, email: userEmail, rut, enabled });
            // 4. Validación de datos mínimos
            if (!nombre || !role || !userEmail) {
                throw new Error('Datos de usuario incompletos');
            }

            // 5. Almacenamiento seguro (considera usar cookies seguras en producción)
            const userData = {
                nombre,
                role,
                email: userEmail,
                rut: rut || null // Asegurarse de incluir el RUT aquí
            };

            // 6. Usar un servicio de almacenamiento seguro en lugar de localStorage directo
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(userData); // Esto debe incluir el RUT

            // 8. Redirección mejorada
            let redirectPath;
            if (role === 'CLIENTE') {
                redirectPath = '/cliente/shop';
            } else if (role === 'SUPERVISOR') {
                redirectPath = '/supervisor/panel';  // o la ruta que desees para el supervisor
            } else {
                redirectPath = `/${role.toLowerCase()}/dashboard`;
            }

            navigate(redirectPath);
            return true;

        } catch (error) {
            console.error('Login error:', error.response);

            // Manejo específico de errores
            if (error.response) {
                const errorCode = error.response.data?.code;
                if (errorCode === 'USER_DISABLED') {
                    throw new Error('USER_DISABLED');
                } else {
                    throw new Error('LOGIN_FAILED');
                }
            } else if (error.request) {
                throw new Error('No se pudo conectar al servidor');
            } else {
                throw error;
            }

            // Mostrar feedback al usuario (podrías usar un estado para esto)
            return false;
        }
    };

    const register = async (nombre, email, password, rut) => {
        if (!email.includes('@') || !email.includes('.')) {
            throw new Error('EMAIL_INVALID');
        }
        try {
            const response = await axios.post('http://localhost:8081/api/auth/register', {
                nombre,
                email,
                password,
                rut
            });

            const { token, nombre: userName, role, email: userEmail, rut: userRut } = response.data;

            const userData = {
                nombre: userName,
                role,
                email: userEmail,
                rut: userRut
            };

            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(userData);

            navigate('/cliente/shop');
            return true;
        } catch (error) {
            console.error('Login error:', error.response);

            if (error.response) {
                // Verificamos el código de error específico
                const errorCode = error.response.data?.code;
                if (errorCode === 'EMAIL_EXISTS') {
                    throw new Error('EMAIL_EXISTS');
                } else if (errorCode === 'RUT_EXISTS') {
                    throw new Error('RUT_EXISTS');
                } else if (errorCode === 'RUT_REQUIRED') {
                    throw new Error('RUT_REQUIRED');
                } else if (errorCode === 'EMAIL_INVALID'){
                    throw new Error('EMAIL_INVALID');
                } else {
                    throw new Error(error.response.data?.message || 'Error al registrarse');
                }
            } else if (error.request) {
                throw new Error('No se pudo conectar al servidor');
            } else {
                throw error;
            }
        }
    };


    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        navigate('/login');
    };

    const updateProfile = async (nombre) => {
        try {
            const response = await axios.put(
                'http://localhost:8081/api/auth/update-profile',
                { nombre },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            const updatedUser = { ...user, nombre: response.data.nombre };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            return true;
        } catch (error) {
            console.error('Update profile error:', error);
            throw error;
        }
    };

    const changePassword = async (currentPassword, newPassword, confirmPassword) => {
        try {
            await axios.put(
                'http://localhost:8081/api/auth/change-password',
                { currentPassword, newPassword, confirmPassword },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            return true;
        } catch (error) {
            console.error('Change password error:', error);
            let errorMessage = 'Error al cambiar la contraseña';

            if (error.response) {
                // Si el backend devuelve un mensaje específico
                if (error.response.data.message.includes('contraseña actual')) {
                    errorMessage = 'La contraseña actual es incorrecta';
                } else if (error.response.data.message.includes('coinciden')) {
                    errorMessage = 'Las nuevas contraseñas no coinciden';
                }
            }

            throw new Error(errorMessage);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            register,
            logout,
            updateProfile,
            changePassword
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}