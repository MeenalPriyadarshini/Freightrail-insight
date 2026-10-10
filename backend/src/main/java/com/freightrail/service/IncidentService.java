package com.freightrail.service;

import com.freightrail.dto.IncidentRequest;
import com.freightrail.entity.FreightTrain;
import com.freightrail.entity.Incident;
import com.freightrail.repository.FreightTrainRepository;
import com.freightrail.repository.IncidentRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final FreightTrainRepository trainRepository;

    public IncidentService(
            IncidentRepository incidentRepository,
            FreightTrainRepository trainRepository) {

        this.incidentRepository = incidentRepository;
        this.trainRepository = trainRepository;
    }

    public List<Incident> getAllIncidents() {
        return incidentRepository.findAll();
    }

    public Incident getIncidentById(Integer id) {
        return incidentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Incident not found with id: " + id));
    }

    public List<Incident> getIncidentsByStatus(String status) {
        return incidentRepository.findByStatus(status);
    }

    public List<Incident> getIncidentsBySeverity(String severity) {
        return incidentRepository.findBySeverity(severity);
    }

    public List<Incident> getIncidentsByTrain(Integer trainId) {
        return incidentRepository.findByTrainTrainId(trainId);
    }

    public Incident createIncident(IncidentRequest request) {

        FreightTrain train = trainRepository.findById(request.getTrainId())
                .orElseThrow(() ->
                        new RuntimeException("Train not found"));

        Incident incident = Incident.builder()
                .train(train)
                .incidentType(request.getIncidentType())
                .severity(request.getSeverity())
                .description(request.getDescription())
                .incidentTime(request.getIncidentTime())
                .status(request.getStatus())
                .build();

        return incidentRepository.save(incident);
    }
}
