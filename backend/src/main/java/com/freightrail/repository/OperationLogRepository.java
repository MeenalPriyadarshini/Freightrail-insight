package com.freightrail.repository;

import com.freightrail.entity.OperationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OperationLogRepository extends JpaRepository<OperationLog, Integer> {

    List<OperationLog> findByTrainTrainId(Integer trainId);

    List<OperationLog> findByShipmentShipmentId(Integer shipmentId);

    List<OperationLog> findByDelayMinutesGreaterThan(Integer delayMinutes);
}
