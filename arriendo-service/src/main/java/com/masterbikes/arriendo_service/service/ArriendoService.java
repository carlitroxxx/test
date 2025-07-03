package com.masterbikes.arriendo_service.service;

import com.masterbikes.arriendo_service.dto.ArriendoRequest;
import com.masterbikes.arriendo_service.model.Arriendo;
import com.masterbikes.arriendo_service.repository.ArriendoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ArriendoService {

    private final ArriendoRepository arriendoRepository;
    private final RestTemplate restTemplate;
    private static final String INVENTARIO_SERVICE_URL = "http://localhost:8080/api/inventario/bicicletas/arriendo/";


    @Autowired
    public ArriendoService(ArriendoRepository arriendoRepository, RestTemplate restTemplate) {
        this.arriendoRepository = arriendoRepository;
        this.restTemplate = restTemplate;
    }

    public Arriendo crearArriendo(ArriendoRequest request) {
        // Validaciones básicas
        if (request.getClienteRut() == null || request.getClienteRut().isEmpty()) {
            throw new IllegalArgumentException("El RUT del cliente es obligatorio");
        }

        if (request.getFechaFin().before(request.getFechaInicio())) {
            throw new IllegalArgumentException("La fecha de fin debe ser posterior a la fecha de inicio");
        }

        // Obtener datos de la bicicleta
        Map<String, Object> bicicleta = obtenerDatosBicicleta(request.getBicicletaId());

        // Validar disponibilidad
        if (!(boolean) bicicleta.getOrDefault("disponible", false)) {
            throw new RuntimeException("La bicicleta no está disponible para arriendo");
        }

        // Obtener datos del cliente
        Map<String, String> clienteInfo = new HashMap<>();
        clienteInfo.put("nombre", request.getClienteNombre());
        clienteInfo.put("rut", request.getClienteRut());
        clienteInfo.put("email", request.getClienteEmail());
        clienteInfo.put("telefono", request.getClienteTelefono());

        // Calcular valores
        long diffInMillis = request.getFechaFin().getTime() - request.getFechaInicio().getTime();
        int dias = (int) (diffInMillis / (1000 * 60 * 60 * 24)) + 1;
        int tarifaDiaria = Integer.parseInt(bicicleta.get("tarifaDiaria").toString());
        int total = dias * tarifaDiaria;
        int deposito = Integer.parseInt(bicicleta.get("valorGarantia").toString());

        // Crear y guardar arriendo
        Long numeroArriendo = arriendoRepository.findTopByOrderByNumeroArriendoDesc()
                .map(Arriendo::getNumeroArriendo)
                .orElse(0L) + 1;

        Arriendo arriendo = new Arriendo();
        arriendo.setNumeroArriendo(numeroArriendo);
        arriendo.setBicicletaId(request.getBicicletaId());
        arriendo.setClienteNombre(clienteInfo.get("nombre"));
        arriendo.setClienteRut(clienteInfo.get("rut"));
        arriendo.setClienteEmail(clienteInfo.get("email"));
        arriendo.setClienteTelefono(clienteInfo.get("telefono"));
        arriendo.setFechaInicio(request.getFechaInicio());
        arriendo.setFechaFin(request.getFechaFin());
        arriendo.setDiasArriendo(dias);
        arriendo.setTarifaDiaria(tarifaDiaria);
        arriendo.setDeposito(deposito);
        arriendo.setTotal(total);
        arriendo.setFormaPago(request.getFormaPago());
        arriendo.setEstado("activo");
        arriendo.setFechaCreacion(new Date());

        return arriendoRepository.save(arriendo);
    }

    private Map<String, Object> obtenerDatosBicicleta(String bicicletaId) {
        try {
            String url = INVENTARIO_SERVICE_URL + bicicletaId;

            // Cambia Object.class por Map.class para mapear correctamente la respuesta
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("Error al obtener bicicleta: " + response.getStatusCode());
            }

            return response.getBody();

        } catch (Exception e) {
            throw new RuntimeException("Error al obtener datos de la bicicleta: " + e.getMessage());
        }
    }

    private Map<String, String> obtenerDatosCliente(ArriendoRequest request) {
        Map<String, String> clienteInfo = new HashMap<>();

        clienteInfo.put("nombre", request.getClienteNombre());
        clienteInfo.put("rut", request.getClienteRut());
        clienteInfo.put("email", request.getClienteEmail());
        clienteInfo.put("telefono", request.getClienteTelefono());

        return clienteInfo;
    }

    private CalculoArriendo calcularValoresArriendo(Date fechaInicio, Date fechaFin, Map<String, Object> bicicleta) {
        long diffInMillis = fechaFin.getTime() - fechaInicio.getTime();
        int dias = (int) (diffInMillis / (1000 * 60 * 60 * 24)) + 1;
        int tarifaDiaria = Integer.parseInt(bicicleta.get("tarifaDiaria").toString());
        int total = dias * tarifaDiaria;
        int deposito = Integer.parseInt(bicicleta.get("deposito").toString());

        return new CalculoArriendo(dias, tarifaDiaria, total, deposito);
    }

    private Arriendo construirArriendo(ArriendoRequest request,
                                       Map<String, String> clienteInfo,
                                       Map<String, Object> bicicleta,
                                       CalculoArriendo calculo) {

        Long numeroArriendo = arriendoRepository.findTopByOrderByNumeroArriendoDesc()
                .map(Arriendo::getNumeroArriendo)
                .orElse(0L) + 1;

        Arriendo arriendo = new Arriendo();
        arriendo.setNumeroArriendo(numeroArriendo);
        arriendo.setBicicletaId(request.getBicicletaId());
        arriendo.setClienteNombre(clienteInfo.get("nombre"));
        arriendo.setClienteRut(clienteInfo.get("rut"));
        arriendo.setClienteEmail(clienteInfo.get("email"));
        arriendo.setClienteTelefono(clienteInfo.get("telefono"));
        arriendo.setFechaInicio(request.getFechaInicio());
        arriendo.setFechaFin(request.getFechaFin());
        arriendo.setDiasArriendo(calculo.dias());
        arriendo.setTarifaDiaria(calculo.tarifaDiaria());
        arriendo.setDeposito(calculo.deposito());
        arriendo.setTotal(calculo.total());
        arriendo.setFormaPago(request.getFormaPago());
        arriendo.setEstado("activo");
        arriendo.setFechaCreacion(new Date());

        return arriendo;
    }

    public Optional<Arriendo> obtenerArriendoPorId(String id) {
        return arriendoRepository.findById(id);
    }

    public Arriendo finalizarArriendo(String arriendoId) {
        return arriendoRepository.findById(arriendoId)
                .map(arriendo -> {
                    arriendo.setEstado("finalizado");
                    return arriendoRepository.save(arriendo);
                })
                .orElseThrow(() -> new RuntimeException("Arriendo no encontrado"));
    }
    public List<Arriendo> obtenerArriendosPorRut(String rut) {
        return arriendoRepository.findByClienteRut(rut);
    }
    public List<Arriendo> obtenerArriendosPorEstado(String estado) {
        return arriendoRepository.findByEstado(estado);
    }

    // Record para cálculos de arriendo (Java 16+)
    private record CalculoArriendo(int dias, int tarifaDiaria, int total, int deposito) {}
}