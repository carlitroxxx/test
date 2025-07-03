package com.masterbikes.inventario_service.repository;

import com.masterbikes.inventario_service.model.ProductoVenta;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ProductoVentaRepository extends MongoRepository<ProductoVenta, String> {
    List<ProductoVenta> findByTipo(String tipo);
    boolean existsById(String id);
}