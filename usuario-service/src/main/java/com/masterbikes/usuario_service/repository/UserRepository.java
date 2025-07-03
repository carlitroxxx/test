package com.masterbikes.usuario_service.repository;

import com.masterbikes.usuario_service.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByRut(String rut);
    Optional<User> findByRut(String rut);
    List<User> findAll();
    @Query("{ '_id' : ?0 }")
    Optional<User> findById(String id);
    @Query("{ $or: [ { 'rut': { $regex: ?0, $options: 'i' } }, { 'nombre': { $regex: ?1, $options: 'i' } } ] }")
    List<User> findByRutRegexOrNombreRegex(String rutRegex, String nombreRegex);
}