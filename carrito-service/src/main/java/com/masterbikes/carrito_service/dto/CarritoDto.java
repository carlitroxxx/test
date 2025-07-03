package com.masterbikes.carrito_service.dto;


import lombok.Data;

import java.util.List;

@Data
public class CarritoDto {
    private String id;
    private String usuarioId;
    private List<ItemCarritoDto> items;
    private int total;
    private String estado;
}