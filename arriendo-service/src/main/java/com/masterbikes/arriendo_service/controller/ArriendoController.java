package com.masterbikes.arriendo_service.controller;

import com.masterbikes.arriendo_service.dto.ArriendoRequest;
import com.masterbikes.arriendo_service.model.Arriendo;
import com.masterbikes.arriendo_service.service.ArriendoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/arriendos")
public class ArriendoController {

    private final ArriendoService arriendoService;

    @Autowired
    public ArriendoController(ArriendoService arriendoService) {
        this.arriendoService = arriendoService;
    }

    @PostMapping
    public ResponseEntity<?> crearArriendo(@RequestBody ArriendoRequest request) {
        try {
            Arriendo nuevoArriendo = arriendoService.crearArriendo(request);
            return new ResponseEntity<>(nuevoArriendo, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }


    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerArriendoPorId(@PathVariable String id) {
        Optional<Arriendo> arriendo = arriendoService.obtenerArriendoPorId(id);
        return arriendo.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/finalizar")
    public ResponseEntity<?> finalizarArriendo(@PathVariable String id) {
        try {
            Arriendo arriendo = arriendoService.finalizarArriendo(id);
            return ResponseEntity.ok(arriendo);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping("/activos")
    public ResponseEntity<List<Arriendo>> obtenerArriendosActivos() {
        List<Arriendo> arriendos = arriendoService.obtenerArriendosPorEstado("activo");
        return ResponseEntity.ok(arriendos);
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<Arriendo>> obtenerArriendosPorEstado(
            @PathVariable String estado) {
        List<Arriendo> arriendos = arriendoService.obtenerArriendosPorEstado(estado);
        return ResponseEntity.ok(arriendos);
    }
    @GetMapping("/cliente/{rut}")
    public ResponseEntity<List<Arriendo>> obtenerArriendosPorCliente(
            @PathVariable String rut) {
        List<Arriendo> arriendos = arriendoService.obtenerArriendosPorRut(rut);
        return ResponseEntity.ok(arriendos);
    }
}