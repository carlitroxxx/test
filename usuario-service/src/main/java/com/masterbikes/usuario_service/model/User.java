package com.masterbikes.usuario_service.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.data.mongodb.core.index.Indexed;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User implements UserDetails {
    @Id
    private String id;
    private String nombre;
    @Indexed(unique = true)
    private String email;
    private String password;
    private String telefono;
    private Role role;
    private boolean enabled = true;
    private Date fechaCreacion = new Date();
    private Date fechaUltimoLogin;
    @Indexed(unique = true)
    private String rut; // Nuevo campo para el RUT

    // Constructor para registro rápido
    public User(String nombre, String email, String password, Role role) {
        this.nombre = nombre;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    // Constructor adicional para incluir RUT
    public User(String nombre, String email, String password, Role role, String rut) {
        this.nombre = nombre;
        this.email = email;
        this.password = password;
        this.role = role;
        this.rut = rut;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getUsername() {
        return email;
    }
    public boolean getEstado(){
        return enabled;
    }
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
}