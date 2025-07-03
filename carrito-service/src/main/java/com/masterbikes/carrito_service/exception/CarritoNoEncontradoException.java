package com.masterbikes.carrito_service.exception;


import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class CarritoNoEncontradoException extends RuntimeException {
    public CarritoNoEncontradoException(String message) {
        super(message);
    }
}