package com.freightrail.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class IncidentRequest {

    private Integer trainId;

    private String incidentType;

    private String severity;

    private String description;

    private LocalDateTime incidentTime;

    private String status;
}
