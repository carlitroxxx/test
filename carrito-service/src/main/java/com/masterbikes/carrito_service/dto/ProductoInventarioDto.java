package com.masterbikes.carrito_service.dto;


import lombok.Data;

import java.util.List;

@Data
public class ProductoInventarioDto {
    private String id;
    private String nombre;
    private String descripcion;
    private int precio;
    private int stock;
    private String tipo;
    private List<String> imagenesUrls;
}