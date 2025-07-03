package com.masterbikes.inventario_service.service;

import com.masterbikes.inventario_service.model.BicicletaArriendo;
import com.masterbikes.inventario_service.model.ProductoVenta;
import com.masterbikes.inventario_service.repository.BicicletaArriendoRepository;
import com.masterbikes.inventario_service.repository.ProductoVentaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@Service
public class CatalogoService {

    private final ProductoVentaRepository productoVentaRepo;
    private final BicicletaArriendoRepository bicicletaArriendoRepo;
    private final CloudinaryService cloudinaryService;

    @Autowired
    public CatalogoService(ProductoVentaRepository productoVentaRepo,
                           BicicletaArriendoRepository bicicletaArriendoRepo, CloudinaryService cloudinaryService) {
        this.productoVentaRepo = productoVentaRepo;
        this.bicicletaArriendoRepo = bicicletaArriendoRepo;
        this.cloudinaryService = cloudinaryService;
    }

    public ProductoVenta guardarProductoVenta(ProductoVenta producto) {
        return productoVentaRepo.save(producto);
    }

    public BicicletaArriendo guardarBicicletaArriendo(BicicletaArriendo bicicleta) {
        return bicicletaArriendoRepo.save(bicicleta);
    }

    public List<ProductoVenta> getProductosVenta() {
        return productoVentaRepo.findAll();
    }

    public List<BicicletaArriendo> getBicicletasArriendo() {
        return bicicletaArriendoRepo.findAll();
    }

    public List<ProductoVenta> getProductosPorTipo(String tipo) {
        return productoVentaRepo.findByTipo(tipo);
    }

    public ProductoVenta agregarImagenesAProducto(String id, List<String> urls) {
        ProductoVenta producto = productoVentaRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + id));
        producto.getImagenesUrls().addAll(urls);
        return productoVentaRepo.save(producto);
    }

    public void eliminarImagenDeProducto(String id, String urlImagen) {
        ProductoVenta producto = productoVentaRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + id));
        producto.getImagenesUrls().remove(urlImagen);
        productoVentaRepo.save(producto);
    }

    public boolean existeProductoConId(String id) {
        return productoVentaRepo.existsById(id);
    }

    public boolean existeBicicletaConId(String id) {
        return bicicletaArriendoRepo.existsById(id);
    }
    // Agrega estos métodos a tu CatalogoService

    public ProductoVenta actualizarProductoVenta(ProductoVenta producto) {
        if (!productoVentaRepo.existsById(producto.getId())) {
            throw new RuntimeException("Producto no encontrado con ID: " + producto.getId());
        }

        // Obtener el producto existente para preservar las imágenes
        ProductoVenta existente = productoVentaRepo.findById(producto.getId()).orElseThrow();
        producto.setImagenesUrls(existente.getImagenesUrls());

        return productoVentaRepo.save(producto);
    }

    public void eliminarProductoVenta(String id) {
        // Obtener el producto primero para manejar las imágenes
        ProductoVenta producto = productoVentaRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + id));

        // Eliminar imágenes de Cloudinary si existen
        if (producto.getImagenesUrls() != null && !producto.getImagenesUrls().isEmpty()) {
            producto.getImagenesUrls().forEach(url -> {
                try {
                    cloudinaryService.deleteImage(url);
                } catch (IOException e) {
                    // Loggear el error pero continuar con la eliminación
                    System.err.println("Error eliminando imagen de Cloudinary: " + e.getMessage());
                }
            });
        }

        productoVentaRepo.deleteById(id);
    }

    public BicicletaArriendo actualizarBicicletaArriendo(BicicletaArriendo bicicleta) {
        if (!bicicletaArriendoRepo.existsById(bicicleta.getId())) {
            throw new RuntimeException("Bicicleta no encontrada con ID: " + bicicleta.getId());
        }
        return bicicletaArriendoRepo.save(bicicleta);
    }

    public void eliminarBicicletaArriendo(String id) {
        if (!bicicletaArriendoRepo.existsById(id)) {
            throw new RuntimeException("Bicicleta no encontrada con ID: " + id);
        }
        bicicletaArriendoRepo.deleteById(id);
    }

    public ProductoVenta obtenerProductoVentaPorId(String id) {
        return productoVentaRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Bicicleta no encontrada con ID: " + id));
    }
    public BicicletaArriendo obtenerArriendoPorId(String id) {
        return bicicletaArriendoRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Bicicleta no encontrada con ID: " + id));
    }
}
