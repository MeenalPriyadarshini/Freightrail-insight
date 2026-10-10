package com.freightrail.controller;

import com.freightrail.dto.OperationLogRequest;
import com.freightrail.entity.OperationLog;
import com.freightrail.service.OperationLogService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/operations")
@CrossOrigin(origins = "*")
public class OperationLogController {

    private final OperationLogService operationLogService;

    public OperationLogController(OperationLogService operationLogService) {
        this.operationLogService = operationLogService;
    }

    @GetMapping
    public List<OperationLog> getAllOperations() {
        return operationLogService.getAllOperations();
    }

    @GetMapping("/{id}")
    public OperationLog getOperationById(@PathVariable Integer id) {
        return operationLogService.getOperationById(id);
    }

    @GetMapping("/train/{trainId}")
    public List<OperationLog> getOperationsByTrain(
            @PathVariable Integer trainId) {

        return operationLogService.getOperationsByTrain(trainId);
    }

    @GetMapping("/shipment/{shipmentId}")
    public List<OperationLog> getOperationsByShipment(
            @PathVariable Integer shipmentId) {

        return operationLogService.getOperationsByShipment(shipmentId);
    }

    @PostMapping
    public OperationLog createOperation(
            @RequestBody OperationLogRequest request) {

        return operationLogService.createOperation(request);
    }
}
