package com.masterbikes.arriendo_service.dto;

import lombok.Data;
import java.util.Date;

@Data
public class ArriendoRequest {
    private String bicicletaId;
    private String usuarioId; // Opcional - si no viene, se crea como cliente externo

    // Datos del cliente (si no viene usuarioId)
    private String clienteNombre;
    private String clienteRut;
    private String clienteEmail;
    private String clienteTelefono;

    private Date fechaInicio;
    private Date fechaFin;
    private String formaPago;
}