package com.masterbikes.carrito_service.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;

@Data
@Document(collection = "carritos")
public class Carrito {
    @Id
    private String id;
    private String usuarioId;
    private List<ItemCarrito> items;
    private Date fechaCreacion;
    private Date fechaActualizacion;
    private EstadoCarrito estado;

    public enum EstadoCarrito {
        ACTIVO,
        COMPLETADO,
        ABANDONADO
    }
}