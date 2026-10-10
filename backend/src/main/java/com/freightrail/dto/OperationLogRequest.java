package com.freightrail.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class OperationLogRequest {

    private Integer trainId;

    private Integer shipmentId;

    private String eventType;

    private LocalDateTime scheduledTime;

    private LocalDateTime actualTime;

    private Integer delayMinutes;

    private LocalDateTime recordedAt;
}
