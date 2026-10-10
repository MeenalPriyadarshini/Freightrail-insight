package com.freightrail.controller;

import com.freightrail.dto.dashboard.DashboardSummary;
import com.freightrail.dto.dashboard.DelayedTrain;
import com.freightrail.dto.dashboard.ShipmentStatusCount;
import com.freightrail.service.DashboardService;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public DashboardSummary getSummary() {
        return dashboardService.getSummary();
    }

    @GetMapping("/delayed-trains")
    public List<DelayedTrain> getDelayedTrains() {
        return dashboardService.getDelayedTrains();
    }

    @GetMapping("/shipment-status")
    public List<ShipmentStatusCount> getShipmentStatus() {
        return dashboardService.getShipmentStatusCounts();
    }

    @GetMapping("/incidents")
    public Map<String, Long> getIncidentCounts() {
        return dashboardService.getIncidentCounts();
    }
}
