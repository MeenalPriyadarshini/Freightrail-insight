import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Customer, DashboardSummary, DelayedTrain, FreightTrain, Incident, IncidentRequest,
  IncidentSeverityMap, OperationLog, OperationLogRequest, Shipment, ShipmentRequest,
  ShipmentStatusCount, Station,
} from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = '/api';

  // Dashboard
  getSummary() { return this.http.get<DashboardSummary>(`${this.base}/dashboard/summary`); }
  getDelayedTrains() { return this.http.get<DelayedTrain[]>(`${this.base}/dashboard/delayed-trains`); }
  getShipmentStatus() { return this.http.get<ShipmentStatusCount[]>(`${this.base}/dashboard/shipment-status`); }
  getIncidentSeverity() { return this.http.get<IncidentSeverityMap>(`${this.base}/dashboard/incidents`); }

  // Reference data
  getCustomers() { return this.http.get<Customer[]>(`${this.base}/customers`); }
  getStations() { return this.http.get<Station[]>(`${this.base}/stations`); }

  // Trains
  getTrains() { return this.http.get<FreightTrain[]>(`${this.base}/trains`); }
  createTrain(t: FreightTrain) { return this.http.post<FreightTrain>(`${this.base}/trains`, t); }
  updateTrain(id: number, t: FreightTrain) { return this.http.put<FreightTrain>(`${this.base}/trains/${id}`, t); }

  // Shipments
  getShipments() { return this.http.get<Shipment[]>(`${this.base}/shipments`); }
  createShipment(r: ShipmentRequest) { return this.http.post<Shipment>(`${this.base}/shipments`, r); }

  // Operations
  getOperations() { return this.http.get<OperationLog[]>(`${this.base}/operations`); }
  createOperation(r: OperationLogRequest) { return this.http.post<OperationLog>(`${this.base}/operations`, r); }

  // Incidents
  getIncidents() { return this.http.get<Incident[]>(`${this.base}/incidents`); }
  createIncident(r: IncidentRequest) { return this.http.post<Incident>(`${this.base}/incidents`, r); }
}