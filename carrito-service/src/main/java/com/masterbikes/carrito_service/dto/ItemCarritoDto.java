package com.masterbikes.carrito_service.dto;

import lombok.Data;

import java.util.List;

@Data
public class ItemCarritoDto {
    private String productoId;
    private String nombre;
    private int precioUnitario;
    private int cantidad;
    private int subtotal;
    private List<String> imagenesUrls;
    private String tipo;
}
