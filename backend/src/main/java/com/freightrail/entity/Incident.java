package com.freightrail.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "incidents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Incident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "incident_id")
    private Integer incidentId;

    @ManyToOne
    @JoinColumn(name = "train_id", nullable = false)
    private FreightTrain train;

    @Column(name = "incident_type", nullable = false)
    private String incidentType;

    @Column(name = "severity", nullable = false)
    private String severity;

    @Column(name = "description")
    private String description;

    @Column(name = "incident_time", nullable = false)
    private LocalDateTime incidentTime;

    @Column(name = "status")
    private String status;
}
