package com.masterbikes.arriendo_service.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import java.util.Date;

@Data
public class ArriendoRequest {
    private String bicicletaId;
    private String clienteRut;
    private String clienteNombre;
    private String clienteEmail;
    private String clienteTelefono;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private Date fechaInicio;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private Date fechaFin;

    private String formaPago;
}