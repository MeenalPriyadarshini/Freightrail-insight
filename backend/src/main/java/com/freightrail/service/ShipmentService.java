package com.freightrail.service;

import com.freightrail.dto.ShipmentRequest;
import com.freightrail.entity.*;
import com.freightrail.repository.*;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final CustomerRepository customerRepository;
    private final FreightTrainRepository trainRepository;
    private final StationRepository stationRepository;

    public ShipmentService(
            ShipmentRepository shipmentRepository,
            CustomerRepository customerRepository,
            FreightTrainRepository trainRepository,
            StationRepository stationRepository) {

        this.shipmentRepository = shipmentRepository;
        this.customerRepository = customerRepository;
        this.trainRepository = trainRepository;
        this.stationRepository = stationRepository;
    }

    public List<Shipment> getAllShipments() {
        return shipmentRepository.findAll();
    }

    public List<Shipment> getShipmentsByStatus(String status) {
        return shipmentRepository.findByStatus(status);
    }

    public Shipment getShipmentById(Integer id) {
        return shipmentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Shipment not found with id: " + id));
    }

    public Shipment createShipment(ShipmentRequest request) {

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() ->
                        new RuntimeException("Customer not found"));

        FreightTrain train = null;

        if (request.getTrainId() != null) {
            train = trainRepository.findById(request.getTrainId())
                    .orElseThrow(() ->
                            new RuntimeException("Train not found"));
        }

        Station origin = stationRepository.findById(request.getOriginStationId())
                .orElseThrow(() ->
                        new RuntimeException("Origin station not found"));

        Station destination = stationRepository.findById(request.getDestinationStationId())
                .orElseThrow(() ->
                        new RuntimeException("Destination station not found"));

        Shipment shipment = Shipment.builder()
                .customer(customer)
                .train(train)
                .cargoType(request.getCargoType())
                .weightTons(request.getWeightTons())
                .originStation(origin)
                .destinationStation(destination)
                .shipmentDate(request.getShipmentDate())
                .expectedDelivery(request.getExpectedDelivery())
                .actualDelivery(request.getActualDelivery())
                .status(request.getStatus())
                .build();

        return shipmentRepository.save(shipment);
    }
}
