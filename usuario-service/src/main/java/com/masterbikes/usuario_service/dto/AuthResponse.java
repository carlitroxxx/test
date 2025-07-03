package com.masterbikes.usuario_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String nombre;
    private String role;
    private String email;
    private String rut; // Nuevo campo RUT
    private boolean enabled;
}