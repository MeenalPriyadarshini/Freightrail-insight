package com.freightrail.controller;

import com.freightrail.entity.FreightTrain;
import com.freightrail.service.FreightTrainService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trains")
@CrossOrigin(origins = "*")
public class FreightTrainController {

    private final FreightTrainService trainService;

    public FreightTrainController(FreightTrainService trainService) {
        this.trainService = trainService;
    }

    @GetMapping
    public List<FreightTrain> getAllTrains() {
        return trainService.getAllTrains();
    }

    @GetMapping("/{id}")
    public FreightTrain getTrainById(@PathVariable Integer id) {
        return trainService.getTrainById(id);
    }

    @PostMapping
    public FreightTrain createTrain(@RequestBody FreightTrain train) {
        return trainService.createTrain(train);
    }

    @PutMapping("/{id}")
    public FreightTrain updateTrain(@PathVariable Integer id, @RequestBody FreightTrain train) {
        return trainService.updateTrain(id, train);
    }
}
