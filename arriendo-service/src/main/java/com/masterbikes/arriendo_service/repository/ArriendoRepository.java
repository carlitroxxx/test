package com.masterbikes.arriendo_service.repository;

import com.masterbikes.arriendo_service.model.Arriendo;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ArriendoRepository extends MongoRepository<Arriendo, String> {
    Optional<Arriendo> findTopByOrderByNumeroArriendoDesc();
    List<Arriendo> findByClienteRut(String rut); // Nuevo método
    List<Arriendo> findByEstado(String estado);
}

