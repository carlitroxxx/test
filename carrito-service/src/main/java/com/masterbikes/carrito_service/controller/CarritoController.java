package com.masterbikes.carrito_service.controller;

import com.masterbikes.carrito_service.dto.*;
import com.masterbikes.carrito_service.service.CarritoService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/carrito")
@AllArgsConstructor
public class CarritoController {
    private final CarritoService carritoService;

    @GetMapping("/{usuarioId}")
    public ResponseEntity<CarritoDto> obtenerCarrito(@PathVariable String usuarioId) {
        return ResponseEntity.ok(carritoService.obtenerCarrito(usuarioId));
    }

    @PostMapping("/{usuarioId}/items")
    public ResponseEntity<CarritoDto> agregarProducto(
            @PathVariable String usuarioId,
            @RequestBody AgregarProductoRequest request) {
        return ResponseEntity.ok(carritoService.agregarProducto(usuarioId, request));
    }

    @PutMapping("/{usuarioId}/items/{productoId}")
    public ResponseEntity<CarritoDto> actualizarCantidad(
            @PathVariable String usuarioId,
            @PathVariable String productoId,
            @RequestBody ActualizarCantidadRequest request) {  // Usar DTO para la cantidad
        return ResponseEntity.ok(carritoService.actualizarCantidad(usuarioId, productoId, request.getCantidad()));
    }

    @DeleteMapping("/{id}/items/{productoId}")
    public ResponseEntity<CarritoDto> eliminarItem(
            @PathVariable String id,
            @PathVariable String productoId,
            @RequestParam String usuarioId) {
        CarritoDto carritoActualizado = carritoService.eliminarItem(id, usuarioId, productoId);
        return ResponseEntity.ok(carritoActualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarCarrito(
            @PathVariable String id,
            @RequestParam String usuarioId) {
        carritoService.eliminarCarrito(id, usuarioId);
        return ResponseEntity.noContent().build();
    }
}