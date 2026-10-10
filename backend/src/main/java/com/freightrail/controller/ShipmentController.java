package com.freightrail.controller;

import com.freightrail.dto.ShipmentRequest;
import com.freightrail.entity.Shipment;
import com.freightrail.service.ShipmentService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shipments")
@CrossOrigin(origins = "*")
public class ShipmentController {

    private final ShipmentService shipmentService;

    public ShipmentController(ShipmentService shipmentService) {
        this.shipmentService = shipmentService;
    }

    @GetMapping
    public List<Shipment> getAllShipments() {
        return shipmentService.getAllShipments();
    }

    @GetMapping("/{id}")
    public Shipment getShipmentById(@PathVariable Integer id) {
        return shipmentService.getShipmentById(id);
    }

    @GetMapping("/status/{status}")
    public List<Shipment> getShipmentsByStatus(
            @PathVariable String status) {

        return shipmentService.getShipmentsByStatus(status);
    }

    @PostMapping
    public Shipment createShipment(
            @RequestBody ShipmentRequest request) {

        return shipmentService.createShipment(request);
    }
}

