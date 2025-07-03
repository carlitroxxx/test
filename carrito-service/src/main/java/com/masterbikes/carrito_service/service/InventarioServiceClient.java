package com.masterbikes.carrito_service.service;

import com.masterbikes.carrito_service.dto.ProductoInventarioDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class InventarioServiceClient {
    private final RestTemplate restTemplate;
    private final String inventarioServiceUrl;

    public InventarioServiceClient(
            RestTemplate restTemplate,
            @Value("${app.inventario-service.url}") String inventarioServiceUrl
    ) {
        this.restTemplate = restTemplate;
        this.inventarioServiceUrl = inventarioServiceUrl;
    }

    public ProductoInventarioDto obtenerProducto(String id) {
        String url = inventarioServiceUrl + "/venta/producto/" + id;
        return restTemplate.getForObject(url, ProductoInventarioDto.class);
    }
}