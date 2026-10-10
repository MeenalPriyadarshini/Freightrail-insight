package com.freightrail.service;

import com.freightrail.dto.dashboard.DashboardSummary;
import com.freightrail.dto.dashboard.DelayedTrain;
import com.freightrail.dto.dashboard.ShipmentStatusCount;
import com.freightrail.entity.FreightTrain;
import com.freightrail.entity.OperationLog;
import com.freightrail.repository.FreightTrainRepository;
import com.freightrail.repository.IncidentRepository;
import com.freightrail.repository.OperationLogRepository;
import com.freightrail.repository.ShipmentRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final FreightTrainRepository trainRepository;
    private final ShipmentRepository shipmentRepository;
    private final IncidentRepository incidentRepository;
    private final OperationLogRepository operationLogRepository;

    public DashboardService(
            FreightTrainRepository trainRepository,
            ShipmentRepository shipmentRepository,
            IncidentRepository incidentRepository,
            OperationLogRepository operationLogRepository) {

        this.trainRepository = trainRepository;
        this.shipmentRepository = shipmentRepository;
        this.incidentRepository = incidentRepository;
        this.operationLogRepository = operationLogRepository;
    }

    public DashboardSummary getSummary() {

        long totalTrains = trainRepository.count();

        long activeTrains =
                trainRepository.countByStatus("ACTIVE");

        long maintenanceTrains =
                trainRepository.countByStatus("MAINTENANCE");

        long totalShipments =
                shipmentRepository.count();

        long delayedShipments =
                shipmentRepository.countByStatus("DELAYED");

        long openIncidents =
                incidentRepository.countByStatus("OPEN");

        return new DashboardSummary(
                totalTrains,
                activeTrains,
                maintenanceTrains,
                totalShipments,
                delayedShipments,
                openIncidents
        );
    }

    public List<DelayedTrain> getDelayedTrains() {

        List<OperationLog> delayedOperations =
                operationLogRepository.findByDelayMinutesGreaterThan(0);

        return delayedOperations.stream()
                .map(operation -> {

                    FreightTrain train = operation.getTrain();

                    return new DelayedTrain(
                            train.getTrainId(),
                            train.getTrainNumber(),
                            train.getTrainName(),
                            operation.getDelayMinutes()
                    );
                })
                .toList();
    }

    public List<ShipmentStatusCount> getShipmentStatusCounts() {

        List<String> statuses = shipmentRepository.findAll()
                .stream()
                .map(shipment -> shipment.getStatus())
                .distinct()
                .toList();

        return statuses.stream()
                .map(status ->
                        new ShipmentStatusCount(
                                status,
                                shipmentRepository.countByStatus(status)
                        )
                )
                .toList();
    }

    public Map<String, Long> getIncidentCounts() {

        return incidentRepository.findAll()
                .stream()
                .collect(Collectors.groupingBy(
                        incident -> incident.getSeverity(),
                        Collectors.counting()
                ));
    }
}
