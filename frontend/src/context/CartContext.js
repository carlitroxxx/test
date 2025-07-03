import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';

const CartContext = createContext();

export function CartProvider({ children }) {
    const { user } = useAuth();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_BASE_URL = 'http://localhost:8083/api/carrito';

    const fetchCart = useCallback(async () => {
        if (!user) {
            setCart(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/${user.email}`);
            setCart(response.data);
        } catch (err) {
            console.error("Error fetching cart:", err);
            setError(err.response?.data?.message || 'Error al cargar el carrito');
            // Si el carrito no existe, crea uno nuevo
            if (err.response?.status === 404) {
                try {
                    const createResponse = await axios.post(API_BASE_URL, { usuarioId: user.email });
                    setCart(createResponse.data);
                } catch (createErr) {
                    console.error("Error creating cart:", createErr);
                    setError('No se pudo crear un nuevo carrito');
                }
            }
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    // En CartContext.js
    const addToCart = async (productoId, cantidad) => {
        if (!user) {
            return {
                success: false,
                error: 'Debes iniciar sesión para agregar productos al carrito'
            };
        }

        try {
            setLoading(true);

            // Verificar si el producto ya existe en el carrito
            const productoExistente = cart?.items?.find(item => item.productoId === productoId);
            const nuevaCantidad = productoExistente ? productoExistente.cantidad + cantidad : cantidad;

            const response = await axios.post(
                `${API_BASE_URL}/${user.email}/items`,
                { productoId, cantidad: nuevaCantidad },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            setCart(response.data);
            return {
                success: true,
                cart: response.data,
                action: productoExistente ? 'updated' : 'added'
            };
        } catch (err) {
            console.error("Error adding to cart:", err);
            const errorMessage = err.response?.data?.message ||
                err.response?.data?.error ||
                'Error al agregar al carrito';
            return {
                success: false,
                error: errorMessage,
                status: err.response?.status
            };
        } finally {
            setLoading(false);
        }
    };


    // En tu CartContext.js
    const getProductStock = async (productoId) => {
        try {
            const response = await axios.get(
                `http://localhost:8080/api/inventario/venta/producto/${productoId}`
            );
            return response.data.stock;
        } catch (err) {
            console.error("Error obteniendo stock:", err);
            return null;
        }
    };


    const updateQuantity = async (productoId, nuevaCantidad) => {
        if (!cart || !user) {
            return {
                success: false,
                error: 'Carrito o usuario no disponible'
            };
        }

        try {
            setLoading(true);
            const response = await axios.put(
                `${API_BASE_URL}/${user.email}/items/${productoId}`,
                { cantidad: nuevaCantidad },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            setCart(response.data);
            return {
                success: true,
                cart: response.data,
                message: 'Cantidad actualizada correctamente'
            };
        } catch (err) {
            console.error("Error updating quantity:", err);
            return {
                success: false,
                error: err.response?.data?.message || 'Error al actualizar cantidad',
                status: err.response?.status,
                data: err.response?.data // Añadimos toda la respuesta del error
            };
        } finally {
            setLoading(false);
        }
    };

    const removeItem = async (productoId) => {
        if (!cart || !user) return;

        try {
            setLoading(true);
            const response = await axios.delete(
                `${API_BASE_URL}/${cart.id}/items/${productoId}?usuarioId=${user.email}`
            );

            // Si el backend no devuelve contenido (204)
            if (response.status === 204) {
                // Forzar recarga del carrito
                await fetchCart();
                return { success: true };
            }

            // Si el backend devuelve el carrito actualizado
            setCart(response.data);
            return { success: true, cart: response.data };

        } catch (err) {
            console.error("Error removing item:", err);
            setError(err.response?.data?.message || 'Error al eliminar producto');
            return { success: false, error: err.response?.data };
        } finally {
            setLoading(false);
        }
    };

    const clearCart = async () => {
        if (!cart || !user) return;

        try {
            setLoading(true);
            const response = await axios.delete(
                `${API_BASE_URL}/${cart.id}?usuarioId=${user.email}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            setCart(null);
            return { success: true };
        } catch (err) {
            console.error("Error clearing cart:", err);
            setError(err.response?.data?.message || 'Error al vaciar el carrito');
            return { success: false, error: err.response?.data };
        } finally {
            setLoading(false);
        }
    };

    const calculateTotal = () => {
        if (!cart?.items) return 0;
        return cart.items.reduce((total, item) => total + (item.precioUnitario * item.cantidad), 0);
    };

    const value = {
        cart,
        loading,
        error,
        fetchCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        calculateTotal,
        itemCount: cart?.items?.reduce((total, item) => total + item.cantidad, 0) || 0
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}