package com.masterbikes.usuario_service.dto;

import com.masterbikes.usuario_service.model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Date;

@Data
@AllArgsConstructor
public class UserResponseDTO {
    private String id;
    private String nombre;
    private String email;
    private Role role;
    private String rut;
    private Date fechaCreacion;
    private boolean enabled;
}
