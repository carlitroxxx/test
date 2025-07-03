package com.masterbikes.arriendo_service.dto;

import lombok.Data;
import java.util.Date;

@Data
public class ArriendoRequest {
    private String bicicletaId;
    // Eliminar usuarioId
    private String clienteRut; // Ahora será obligatorio
    private String clienteNombre;
    private String clienteEmail;
    private String clienteTelefono;

    private Date fechaInicio;
    private Date fechaFin;
    private String formaPago;
}