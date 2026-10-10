package com.freightrail.controller;

import com.freightrail.entity.Station;
import com.freightrail.repository.StationRepository;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stations")
@CrossOrigin(origins = "*")
public class StationController {

    private final StationRepository stationRepository;

    public StationController(StationRepository stationRepository) {
        this.stationRepository = stationRepository;
    }

    @GetMapping
    public List<Station> getAllStations() {
        return stationRepository.findAll(Sort.by("stationName"));
    }

    @GetMapping("/{id}")
    public Station getStationById(@PathVariable Integer id) {
        return stationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Station not found: " + id));
    }
}