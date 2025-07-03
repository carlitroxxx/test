package com.masterbikes.carrito_service.model;

import lombok.Data;

import java.util.List;

@Data
public class ItemCarrito {
    private String productoId;
    private String nombre;
    private int precioUnitario;
    private int cantidad;
    private List<String> imagenesUrls;
    private String tipo;
}