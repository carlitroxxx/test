package com.masterbikes.arriendo_service.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.util.Date;

@Document(collection = "arriendos")
@Data
public class Arriendo {
    @Id
    private String id;
    private Long numeroArriendo; // Auto-incremental
    private String bicicletaId; // Referencia a bicicleta en inventario-service
    private String usuarioId; // Referencia a usuario en usuario-service

    // Datos del cliente (pueden venir de usuario-service o ingresarse manualmente)
    private String clienteNombre;
    private String clienteRut;
    private String clienteEmail;
    private String clienteTelefono;

    private Date fechaInicio;
    private Date fechaFin;
    private int diasArriendo;
    private int tarifaDiaria;
    private int deposito;
    private int total;
    private String formaPago;
    private String estado; // "activo", "finalizado", "cancelado"
    private Date fechaCreacion;
}