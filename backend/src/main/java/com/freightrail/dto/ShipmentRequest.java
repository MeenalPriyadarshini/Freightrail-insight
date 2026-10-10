package com.freightrail.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ShipmentRequest {

    private Integer customerId;

    private Integer trainId;

    private String cargoType;

    private BigDecimal weightTons;

    private Integer originStationId;

    private Integer destinationStationId;

    private LocalDate shipmentDate;

    private LocalDateTime expectedDelivery;

    private LocalDateTime actualDelivery;

    private String status;
}
