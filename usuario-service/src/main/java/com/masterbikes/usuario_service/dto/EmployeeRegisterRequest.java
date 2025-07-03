package com.masterbikes.usuario_service.dto;


import com.masterbikes.usuario_service.model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmployeeRegisterRequest {
    private String nombre;
    private String email;
    private String password;
    private Role role;
    private String rut;
}