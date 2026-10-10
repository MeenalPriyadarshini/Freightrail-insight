package com.freightrail.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DashboardSummary {

    private long totalTrains;
    private long activeTrains;
    private long maintenanceTrains;

    private long totalShipments;
    private long delayedShipments;

    private long openIncidents;
}
