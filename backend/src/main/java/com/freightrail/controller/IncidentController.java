package com.freightrail.controller;

import com.freightrail.dto.IncidentRequest;
import com.freightrail.entity.Incident;
import com.freightrail.service.IncidentService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incidents")
@CrossOrigin(origins = "*")
public class IncidentController {

    private final IncidentService incidentService;

    public IncidentController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    @GetMapping
    public List<Incident> getAllIncidents() {
        return incidentService.getAllIncidents();
    }

    @GetMapping("/{id}")
    public Incident getIncidentById(@PathVariable Integer id) {
        return incidentService.getIncidentById(id);
    }

    @GetMapping("/status/{status}")
    public List<Incident> getIncidentsByStatus(
            @PathVariable String status) {

        return incidentService.getIncidentsByStatus(status);
    }

    @GetMapping("/severity/{severity}")
    public List<Incident> getIncidentsBySeverity(
            @PathVariable String severity) {

        return incidentService.getIncidentsBySeverity(severity);
    }

    @GetMapping("/train/{trainId}")
    public List<Incident> getIncidentsByTrain(
            @PathVariable Integer trainId) {

        return incidentService.getIncidentsByTrain(trainId);
    }

    @PostMapping
    public Incident createIncident(
            @RequestBody IncidentRequest request) {

        return incidentService.createIncident(request);
    }
}
