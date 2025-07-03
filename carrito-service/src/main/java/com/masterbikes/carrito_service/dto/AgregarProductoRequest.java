package com.masterbikes.carrito_service.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class AgregarProductoRequest {
    @NotBlank(message = "El ID del producto no puede estar vacío")
    private String productoId;

    @NotNull(message = "La cantidad no puede ser nula")
    @Min(value = 1, message = "La cantidad debe ser al menos 1")
    private Integer cantidad;
}