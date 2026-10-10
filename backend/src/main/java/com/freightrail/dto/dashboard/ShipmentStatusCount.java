package com.freightrail.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ShipmentStatusCount {

    private String status;
    private long count;
}
