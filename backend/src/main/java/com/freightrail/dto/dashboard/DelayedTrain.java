package com.freightrail.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DelayedTrain {

    private Integer trainId;
    private String trainNumber;
    private String trainName;
    private Integer delayMinutes;
}
