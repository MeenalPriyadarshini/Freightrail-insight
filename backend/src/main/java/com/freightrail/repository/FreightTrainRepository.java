package com.freightrail.repository;

import com.freightrail.entity.FreightTrain;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FreightTrainRepository extends JpaRepository<FreightTrain, Integer> {

    Optional<FreightTrain> findByTrainNumber(String trainNumber);

    long countByStatus(String status);

    List<FreightTrain> findByStatus(String status);
}