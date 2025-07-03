package com.masterbikes.carrito_service.service;

import com.masterbikes.carrito_service.dto.*;
import com.masterbikes.carrito_service.exception.*;
import com.masterbikes.carrito_service.model.*;
import com.masterbikes.carrito_service.repository.*;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Date;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class CarritoService {
    private final CarritoRepository carritoRepository;
    private final InventarioServiceClient inventarioClient;

    @Transactional
    public CarritoDto obtenerCarrito(String usuarioId) {
        Carrito carrito = carritoRepository
                .findByUsuarioIdAndEstado(usuarioId, Carrito.EstadoCarrito.ACTIVO)
                .orElseGet(() -> crearCarritoInicial(usuarioId));
        return convertirADto(carrito);
    }
    @Transactional
    public void eliminarCarrito(String id, String usuarioId) {
        Carrito carrito = carritoRepository.findByIdAndUsuarioId(id, usuarioId)
                .orElseThrow(() -> new CarritoNoEncontradoException("Carrito no encontrado"));

        carrito.setEstado(Carrito.EstadoCarrito.ABANDONADO);
        carrito.setFechaActualizacion(new Date());
        carritoRepository.save(carrito);
    }
    @Transactional
    public CarritoDto actualizarCantidad(String usuarioId, String productoId, int cantidad) {
        if (cantidad <= 0) {
            throw new StockInsuficienteException("La cantidad debe ser mayor a cero");
        }

        Carrito carrito = carritoRepository
                .findByUsuarioIdAndEstado(usuarioId, Carrito.EstadoCarrito.ACTIVO)
                .orElseThrow(() -> new CarritoNoEncontradoException("Carrito no encontrado"));

        // Verificar si el producto existe en el carrito
        boolean productoEnCarrito = carrito.getItems().stream()
                .anyMatch(item -> item.getProductoId().equals(productoId));

        if (!productoEnCarrito) {
            throw new ProductoNoEncontradoException("El producto no existe en el carrito");
        }

        ProductoInventarioDto producto = inventarioClient.obtenerProducto(productoId);
        if (producto == null) throw new ProductoNoEncontradoException("Producto no encontrado en inventario");
        if (producto.getStock() < cantidad) throw new StockInsuficienteException("Stock insuficiente");

        // Actualizar cantidad
        carrito.getItems().stream()
                .filter(item -> item.getProductoId().equals(productoId))
                .findFirst()
                .ifPresent(item -> item.setCantidad(cantidad));

        carrito.setFechaActualizacion(new Date());
        return convertirADto(carritoRepository.save(carrito));
    }
    @Transactional
    public CarritoDto agregarProducto(String usuarioId, AgregarProductoRequest request) {
        ProductoInventarioDto producto = inventarioClient.obtenerProducto(request.getProductoId());
        if (producto == null) throw new ProductoNoEncontradoException("Producto no encontrado");
        if (producto.getStock() < request.getCantidad()) throw new StockInsuficienteException("Stock insuficiente");

        Carrito carrito = carritoRepository
                .findByUsuarioIdAndEstado(usuarioId, Carrito.EstadoCarrito.ACTIVO)
                .orElseGet(() -> crearCarritoInicial(usuarioId));

        carrito.getItems().removeIf(item -> item.getProductoId().equals(request.getProductoId()));
        carrito.getItems().add(crearItemCarrito(producto, request.getCantidad()));
        carrito.setFechaActualizacion(new Date());

        return convertirADto(carritoRepository.save(carrito));
    }

    @Transactional
    public CarritoDto eliminarItem(String carritoId, String usuarioId, String productoId) {
        Carrito carrito = carritoRepository.findByIdAndUsuarioId(carritoId, usuarioId)
                .orElseThrow(() -> new CarritoNoEncontradoException("Carrito no encontrado"));
        carrito.getItems().removeIf(item -> item.getProductoId().equals(productoId));
        carrito.setFechaActualizacion(new Date());
        Carrito carritoActualizado = carritoRepository.save(carrito);
        return convertirADto(carritoActualizado);
    }

    // ... (métodos auxiliares crearCarritoInicial, crearItemCarrito, convertirADto)
    // Métodos auxiliares privados
    private Carrito crearCarritoInicial(String usuarioId) {
        Carrito carrito = new Carrito();
        carrito.setUsuarioId(usuarioId);
        carrito.setFechaCreacion(new Date());
        carrito.setFechaActualizacion(new Date());
        carrito.setEstado(Carrito.EstadoCarrito.ACTIVO);
        carrito.setItems(new ArrayList<>());
        return carritoRepository.save(carrito);
    }

    private ItemCarrito crearItemCarrito(ProductoInventarioDto producto, int cantidad) {
        ItemCarrito item = new ItemCarrito();
        item.setProductoId(producto.getId());
        item.setNombre(producto.getNombre());
        item.setPrecioUnitario(producto.getPrecio());
        item.setCantidad(cantidad);
        item.setImagenesUrls(producto.getImagenesUrls());
        item.setTipo(producto.getTipo());
        return item;
    }

    private CarritoDto convertirADto(Carrito carrito) {
        CarritoDto dto = new CarritoDto();
        dto.setId(carrito.getId());
        dto.setUsuarioId(carrito.getUsuarioId());
        dto.setEstado(carrito.getEstado().name());

        dto.setItems(carrito.getItems().stream()
                .map(item -> {
                    ItemCarritoDto itemDto = new ItemCarritoDto();
                    itemDto.setProductoId(item.getProductoId());
                    itemDto.setNombre(item.getNombre());
                    itemDto.setPrecioUnitario(item.getPrecioUnitario());
                    itemDto.setCantidad(item.getCantidad());
                    itemDto.setSubtotal(item.getPrecioUnitario() * item.getCantidad());
                    itemDto.setImagenesUrls(item.getImagenesUrls());
                    itemDto.setTipo(item.getTipo());
                    return itemDto;
                })
                .collect(Collectors.toList()));

        dto.setTotal(dto.getItems().stream()
                .mapToInt(ItemCarritoDto::getSubtotal)
                .sum());

        return dto;
    }
}