package com.masterbikes.inventario_service.repository;

import com.masterbikes.inventario_service.model.BicicletaArriendo;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface BicicletaArriendoRepository extends MongoRepository<BicicletaArriendo, String> {
    List<BicicletaArriendo> findByDisponible(boolean disponible);
    boolean existsById(String id);
}