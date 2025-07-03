package com.masterbikes.usuario_service.controller;

import com.masterbikes.usuario_service.dto.*;
import com.masterbikes.usuario_service.model.Role;
import com.masterbikes.usuario_service.model.User;
import com.masterbikes.usuario_service.repository.UserRepository;
import com.masterbikes.usuario_service.service.AuthService;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    public AuthController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }


    // En tu AuthController.java
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            AuthResponse response = authService.login(request.getEmail(), request.getPassword());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            if ("USER_DISABLED".equals(e.getMessage())) {
                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN) // 403 Forbidden (cuenta deshabilitada)
                        .body(new ErrorResponse("USER_DISABLED", "La cuenta está deshabilitada"));
            } else {
                // Otros errores (credenciales inválidas, usuario no encontrado, etc.)
                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED) // 401 Unauthorized
                        .body(new ErrorResponse("LOGIN_FAILED", "Credenciales inválidas"));
            }
        }
    }

    // AuthController.java (fragmento actualizado)
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            if (request.getRut() == null || request.getRut().trim().isEmpty()) {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(new ErrorResponse("RUT_REQUIRED", "El RUT es obligatorio")); // 2 args
            }

            authService.registerClient(request);
            AuthResponse response = authService.login(request.getEmail(), request.getPassword());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            String errorCode = e.getMessage();
            if ("EMAIL_EXISTS".equals(errorCode)) {
                return ResponseEntity
                        .status(HttpStatus.CONFLICT)
                        .body(new ErrorResponse("EMAIL_EXISTS", "El correo ya está en uso")); // 2 args
            } else if ("RUT_EXISTS".equals(errorCode)) {
                return ResponseEntity
                        .status(HttpStatus.CONFLICT)
                        .body(new ErrorResponse("RUT_EXISTS", "El RUT ya está registrado")); // 2 args
            } else {
                return ResponseEntity
                        .status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(new ErrorResponse("UNKNOWN_ERROR", "Error al registrar")); // 2 args
            }
        }
    }
    @PostMapping("/register/employee")
    @PreAuthorize("hasRole('SUPERVISOR')")
    public ResponseEntity<?> registerEmployee(@RequestBody EmployeeRegisterRequest request) {
        try {
            if (request.getRut() == null || request.getRut().trim().isEmpty()) {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(new ErrorResponse("RUT_REQUIRED", "El RUT es obligatorio")); // 2 args
            }

            authService.registerEmployee(request);
            AuthResponse response = authService.login(request.getEmail(), request.getPassword());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            String errorCode = e.getMessage();
            if ("EMAIL_EXISTS".equals(errorCode)) {
                return ResponseEntity
                        .status(HttpStatus.CONFLICT)
                        .body(new ErrorResponse("EMAIL_EXISTS", "El correo ya está en uso")); // 2 args
            } else if ("RUT_EXISTS".equals(errorCode)) {
                return ResponseEntity
                        .status(HttpStatus.CONFLICT)
                        .body(new ErrorResponse("RUT_EXISTS", "El RUT ya está registrado")); // 2 args
            } else {
                return ResponseEntity
                        .status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(new ErrorResponse("UNKNOWN_ERROR", "Error al registrar")); // 2 args
            }
        }


    }


    // Agrega esto a AuthController.java

    @PutMapping("/update-profile")
    @PreAuthorize("hasAnyRole('CLIENTE', 'VENDEDOR', 'TECNICO', 'INVENTARIO', 'SUPERVISOR')")
    public ResponseEntity<User> updateProfile(@RequestBody UpdateProfileRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User updatedUser = authService.updateProfile(email, request);
        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/change-password")
    @PreAuthorize("hasAnyRole('CLIENTE', 'VENDEDOR', 'TECNICO', 'INVENTARIO', 'SUPERVISOR')")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            authService.changePassword(email, request);
            return ResponseEntity.ok("Contraseña actualizada correctamente");
        } catch (RuntimeException e) {
            // Asignar un código de error genérico para este caso
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("PASSWORD_ERROR", e.getMessage())); // <- Ahora con código
        }
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('SUPERVISOR')") // Solo el supervisor puede ver todos los usuarios
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<UserResponseDTO> response = users.stream()
                .map(user -> new UserResponseDTO(
                        user.getId(),
                        user.getNombre(),
                        user.getEmail(),
                        user.getRole(),
                        user.getRut(),
                        user.getFechaCreacion(),
                        user.getEstado()
                ))
                .toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/buscar-usuarios")
    public ResponseEntity<List<User>> buscarUsuarios(@RequestParam String query) {
        // Usa una expresión regular para buscar coincidencias parciales en RUT o nombre
        String regex = ".*" + query + ".*";
        List<User> usuarios = userRepository.findByRutRegexOrNombreRegex(regex, regex);
        return ResponseEntity.ok(usuarios);
    }
    @GetMapping("/buscar-por-rut")
    public ResponseEntity<?> buscarPorRut(@RequestParam String rut) {
        try {
            // Buscar directamente por RUT usando el repositorio
            Optional<User> usuario = userRepository.findByRut(rut);

            if (usuario.isPresent()) {
                User user = usuario.get();
                return ResponseEntity.ok(Map.of(
                        "nombre", user.getNombre(),
                        "email", user.getEmail(),
                        "telefono", user.getTelefono() != null ? user.getTelefono() : "",
                        "rut", user.getRut(),
                        "role", user.getRole().name() // Agregar el rol si es necesario
                ));
            }

            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No se encontró usuario con RUT: " + rut);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al buscar usuario: " + e.getMessage());
        }
    }
    @PatchMapping("/users/{userId}/status")
    @PreAuthorize("hasRole('SUPERVISOR')")
    public ResponseEntity<?> updateUserStatus(
            @PathVariable String userId,
            @RequestBody Map<String, Boolean> statusRequest
    ) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("USER_NOT_FOUND"));

            user.setEnabled(statusRequest.get("enabled"));
            userRepository.save(user);

            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("STATUS_UPDATE_ERROR", e.getMessage()));
        }
    }

    // Clase adicional para la respuesta de error
    // Dentro de AuthController.java
    @Data
    @AllArgsConstructor
    class ErrorResponse {
        private String code;  // <- Añade este campo
        private String message;
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('CLIENTE', 'VENDEDOR', 'TECNICO', 'INVENTARIO', 'SUPERVISOR')")
    public ResponseEntity<User> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return ResponseEntity.ok(user);
    }


}
