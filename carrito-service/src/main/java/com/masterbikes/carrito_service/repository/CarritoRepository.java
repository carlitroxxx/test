package com.masterbikes.carrito_service.repository;

import com.masterbikes.carrito_service.model.Carrito;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface CarritoRepository extends MongoRepository<Carrito, String> {
    Optional<Carrito> findByUsuarioIdAndEstado(String usuarioId, Carrito.EstadoCarrito estado);
    Optional<Carrito> findByIdAndUsuarioId(String id, String usuarioId);
}
