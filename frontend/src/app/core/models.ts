export interface DashboardSummary {
  totalTrains: number;
  activeTrains: number;
  maintenanceTrains: number;
  totalShipments: number;
  delayedShipments: number;
  openIncidents: number;
}

export interface DelayedTrain {
  trainId: number;
  trainNumber: string;
  trainName: string;
  delayMinutes: number;
}

export interface ShipmentStatusCount {
  status: string;
  count: number;
}

export type IncidentSeverityMap = Record<string, number>;

export interface FreightTrain {
  trainId?: number;
  trainNumber: string;
  trainName: string;
  capacityTons: number;
  status: string;
}

// NOTE: nested shapes depend on how your entities serialize.
// Check with: curl localhost:8082/api/shipments  and adjust if needed.
export interface Shipment {
  shipmentId: number;
  customer?: { companyName: string };
  train?: { trainNumber: string };
  cargoType: string;
  weightTons: number;
  originStation?: { stationName: string };
  destinationStation?: { stationName: string };
  shipmentDate: string;
  expectedDelivery: string;
  actualDelivery?: string | null;
  status: string;
}

export interface OperationLog {
  operationId: number;
  train?: { trainNumber: string };
  shipment?: { shipmentId: number };
  eventType: string;
  scheduledTime: string;
  actualTime: string;
  delayMinutes: number;
}

export interface Incident {
  incidentId: number;
  train?: { trainNumber: string };
  incidentType: string;
  severity: string;
  description: string;
  incidentTime: string;
  status: string;
}

export interface Customer {
  customerId: number;
  companyName: string;
  contactPerson?: string;
  phone?: string;
  city?: string;
}

export interface Station {
  stationId: number;
  stationCode: string;
  stationName: string;
  city?: string;
  state?: string;
}

// Request bodies (match your Java DTOs)
export interface ShipmentRequest {
  customerId: number;
  trainId: number | null;
  cargoType: string;
  weightTons: number;
  originStationId: number;
  destinationStationId: number;
  shipmentDate: string;
  expectedDelivery: string;
  actualDelivery: string | null;
  status: string;
}

export interface OperationLogRequest {
  trainId: number;
  shipmentId: number | null;
  eventType: string;
  scheduledTime: string;
  actualTime: string | null;
  delayMinutes: number | null;
  recordedAt: string;
}

export interface IncidentRequest {
  trainId: number;
  incidentType: string;
  severity: string;
  description: string;
  incidentTime: string;
  status: string;
}