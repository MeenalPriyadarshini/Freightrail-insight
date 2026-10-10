package com.freightrail.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "freight_trains")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FreightTrain {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "train_id")
    private Integer trainId;

    @Column(name = "train_number", nullable = false, unique = true)
    private String trainNumber;

    @Column(name = "train_name", nullable = false)
    private String trainName;

    @Column(name = "capacity_tons", nullable = false)
    private BigDecimal capacityTons;

    @Column(name = "status")
    private String status;
}
