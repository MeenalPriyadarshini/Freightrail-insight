package com.freightrail.service;

import com.freightrail.dto.OperationLogRequest;
import com.freightrail.entity.FreightTrain;
import com.freightrail.entity.OperationLog;
import com.freightrail.entity.Shipment;
import com.freightrail.repository.FreightTrainRepository;
import com.freightrail.repository.OperationLogRepository;
import com.freightrail.repository.ShipmentRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OperationLogService {

    private final OperationLogRepository operationLogRepository;
    private final FreightTrainRepository trainRepository;
    private final ShipmentRepository shipmentRepository;

    public OperationLogService(
            OperationLogRepository operationLogRepository,
            FreightTrainRepository trainRepository,
            ShipmentRepository shipmentRepository) {

        this.operationLogRepository = operationLogRepository;
        this.trainRepository = trainRepository;
        this.shipmentRepository = shipmentRepository;
    }

    public List<OperationLog> getAllOperations() {
        return operationLogRepository.findAll();
    }

    public OperationLog getOperationById(Integer id) {
        return operationLogRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Operation not found with id: " + id));
    }

    public List<OperationLog> getOperationsByTrain(Integer trainId) {
        return operationLogRepository.findByTrainTrainId(trainId);
    }

    public List<OperationLog> getOperationsByShipment(Integer shipmentId) {
        return operationLogRepository.findByShipmentShipmentId(shipmentId);
    }

    public OperationLog createOperation(OperationLogRequest request) {

        FreightTrain train = trainRepository.findById(request.getTrainId())
                .orElseThrow(() ->
                        new RuntimeException("Train not found"));

        Shipment shipment = null;

        if (request.getShipmentId() != null) {
            shipment = shipmentRepository.findById(request.getShipmentId())
                    .orElseThrow(() ->
                            new RuntimeException("Shipment not found"));
        }

        OperationLog operation = OperationLog.builder()
                .train(train)
                .shipment(shipment)
                .eventType(request.getEventType())
                .scheduledTime(request.getScheduledTime())
                .actualTime(request.getActualTime())
                .delayMinutes(request.getDelayMinutes())
                .recordedAt(
                        request.getRecordedAt() != null
                                ? request.getRecordedAt()
                                : LocalDateTime.now()
                )
                .build();

        return operationLogRepository.save(operation);
    }
}
