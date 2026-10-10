package com.freightrail.service;

import com.freightrail.entity.FreightTrain;
import com.freightrail.repository.FreightTrainRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FreightTrainService {

    private final FreightTrainRepository trainRepository;

    public FreightTrainService(FreightTrainRepository trainRepository) {
        this.trainRepository = trainRepository;
    }

    public List<FreightTrain> getAllTrains() {
        return trainRepository.findAll();
    }

    public FreightTrain getTrainById(Integer id) {
        return trainRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Train not found with id: " + id));
    }

    public FreightTrain createTrain(FreightTrain train) {
        return trainRepository.save(train);
    }

    public FreightTrain updateTrain(Integer id, FreightTrain updatedTrain) {
        FreightTrain existing = getTrainById(id);
        existing.setTrainNumber(updatedTrain.getTrainNumber());
        existing.setTrainName(updatedTrain.getTrainName());
        existing.setCapacityTons(updatedTrain.getCapacityTons());
        existing.setStatus(updatedTrain.getStatus());
        return trainRepository.save(existing);
    }
}
