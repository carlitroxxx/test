package com.masterbikes.inventario_service.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "productos_venta")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductoVenta {
    @Id
    private String id;
    private String nombre;
    private String descripcion;
    private int precio;
    private int stock;
    private String tipo; // "bicicleta" o "componente"

    @Field("imagenes_urls")
    private List<String> imagenesUrls = new ArrayList<>();
}