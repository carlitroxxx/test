package com.masterbikes.inventario_service.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Document(collection = "bicicletas_arriendo")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BicicletaArriendo {
    @Id
    private String id;
    private String nombre;
    private String descripcion;
    private int tarifaDiaria;
    private boolean disponible;
    private int valorGarantia; // Nuevo atributo
}