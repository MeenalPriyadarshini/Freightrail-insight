import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TrainsComponent } from './trains/trains.component';
import { ShipmentsComponent } from './shipments/shipments.component';
import { OperationsComponent } from './operations/operations.component';
import { IncidentsComponent } from './incidents/incidents.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'trains', component: TrainsComponent },
  { path: 'shipments', component: ShipmentsComponent },
  { path: 'operations', component: OperationsComponent },
  { path: 'incidents', component: IncidentsComponent },
  { path: '**', redirectTo: 'dashboard' },
];