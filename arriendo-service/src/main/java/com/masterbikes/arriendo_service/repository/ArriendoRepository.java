package com.masterbikes.arriendo_service.repository;

import com.masterbikes.arriendo_service.model.Arriendo;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ArriendoRepository extends MongoRepository<Arriendo, String> {
    Optional<Arriendo> findTopByOrderByNumeroArriendoDesc(); // Cambiado a Optional
    List<Arriendo> findByUsuarioId(String usuarioId);
    List<Arriendo> findByEstado(String estado);
}

