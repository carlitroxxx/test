package com.masterbikes.usuario_service.service;


import com.masterbikes.usuario_service.dto.*;
import com.masterbikes.usuario_service.model.Role;
import com.masterbikes.usuario_service.model.User;
import com.masterbikes.usuario_service.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public AuthResponse login(String email, String password) {
        // Primero verificar si el usuario existe y está habilitado
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!user.isEnabled()) {
            throw new RuntimeException("USER_DISABLED");
        }

        // Luego proceder con la autenticación
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        user.setFechaUltimoLogin(new Date());
        userRepository.save(user);

        String token = jwtService.generateToken(user);

        return new AuthResponse(token, user.getNombre(), user.getRole().name(), user.getEmail(), user.getRut(), user.getEstado());
    }

    public User registerClient(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("EMAIL_EXISTS"); // Mensaje clave para el frontend
        }

        if (request.getRut() != null && !request.getRut().isEmpty() &&
                userRepository.existsByRut(request.getRut())) {
            throw new RuntimeException("RUT_EXISTS"); // Mensaje clave para el frontend
        }

        User user = new User();
        user.setNombre(request.getNombre());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.CLIENTE);
        user.setRut(request.getRut());

        return userRepository.save(user);
    }

    public User registerEmployee(EmployeeRegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("EMAIL_EXISTS"); // Mensaje clave para el frontend
        }

        if (request.getRut() != null && !request.getRut().isEmpty() &&
                userRepository.existsByRut(request.getRut())) {
            throw new RuntimeException("RUT_EXISTS"); // Mensaje clave para el frontend
        }

        User user = new User();
        user.setNombre(request.getNombre());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setRut(request.getRut());

        return userRepository.save(user);
    }

    public User updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        user.setNombre(request.getNombre());
        return userRepository.save(user);
    }

    public void changePassword(String email, ChangePasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Las nuevas contraseñas no coinciden");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("La contraseña actual es incorrecta");
        }

        if (request.getNewPassword().length() < 6) {
            throw new RuntimeException("La nueva contraseña debe tener al menos 6 caracteres");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

}