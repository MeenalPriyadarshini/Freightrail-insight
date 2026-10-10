import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { FreightTrain, Incident, IncidentRequest } from '../core/models';
import { StatusBadgeComponent } from '../shared/status-badge.component';

@Component({
  selector: 'app-incidents',
  imports: [DatePipe, FormsModule, StatusBadgeComponent],
  template: `
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold">Incidents</h1>
      <div class="flex gap-2">
        <select class="rounded border bg-white p-2" (change)="status.set($any($event.target).value)">
          <option value="">All statuses</option>
          <option>OPEN</option><option>RESOLVED</option>
        </select>
        <select class="rounded border bg-white p-2" (change)="severity.set($any($event.target).value)">
          <option value="">All severities</option>
          @for (s of severities; track s) { <option>{{ s }}</option> }
        </select>
        <button class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700" (click)="showForm.set(!showForm())">
          {{ showForm() ? 'Close' : '+ New Incident' }}
        </button>
      </div>
    </div>

    @if (showForm()) {
      <form #f="ngForm" (ngSubmit)="save()" class="mb-6 grid gap-3 rounded-lg bg-white p-4 shadow md:grid-cols-4">
        <label class="text-sm">Train
          <select class="mt-1 w-full rounded border p-2" name="train" [(ngModel)]="form.trainId" required>
            <option [ngValue]="null" disabled>Select…</option>
            @for (t of trains(); track t.trainId) { <option [ngValue]="t.trainId">{{ t.trainNumber }} – {{ t.trainName }}</option> }
          </select>
        </label>
        <label class="text-sm">Incident type
          <select class="mt-1 w-full rounded border p-2" name="type" [(ngModel)]="form.incidentType" required>
            @for (t of types; track t) { <option>{{ t }}</option> }
          </select>
        </label>
        <label class="text-sm">Severity
          <select class="mt-1 w-full rounded border p-2" name="sev" [(ngModel)]="form.severity" required>
            @for (s of severities; track s) { <option>{{ s }}</option> }
          </select>
        </label>
        <label class="text-sm">Status
          <select class="mt-1 w-full rounded border p-2" name="status" [(ngModel)]="form.status">
            <option>OPEN</option><option>RESOLVED</option>
          </select>
        </label>
        <label class="text-sm md:col-span-2">Description
          <input class="mt-1 w-full rounded border p-2" name="desc" [(ngModel)]="form.description" />
        </label>
        <label class="text-sm">Incident time
          <input class="mt-1 w-full rounded border p-2" type="datetime-local" name="time" [(ngModel)]="form.incidentTime" required />
        </label>
        <div class="flex items-end">
          <button [disabled]="f.invalid" class="rounded bg-green-600 px-5 py-2 text-white hover:bg-green-700 disabled:opacity-40">
            Save incident
          </button>
        </div>
      </form>
    }

    @if (error()) { <div class="mb-4 rounded bg-red-100 p-3 text-red-700">{{ error() }}</div> }

    <div class="overflow-x-auto rounded-lg bg-white shadow">
      <table class="w-full text-left text-sm">
        <thead class="border-b bg-slate-50 text-slate-500">
          <tr><th class="p-3">#</th><th>Train</th><th>Type</th><th>Severity</th><th>Description</th><th>Time</th><th>Status</th></tr>
        </thead>
        <tbody>
          @for (i of filtered(); track i.incidentId) {
            <tr class="border-b last:border-0">
              <td class="p-3">{{ i.incidentId }}</td>
              <td>{{ i.train?.trainNumber }}</td>
              <td>{{ i.incidentType }}</td>
              <td><app-status-badge [value]="i.severity" /></td>
              <td class="max-w-xs">{{ i.description }}</td>
              <td>{{ i.incidentTime | date: 'dd MMM, HH:mm' }}</td>
              <td><app-status-badge [value]="i.status" /></td>
            </tr>
          } @empty {
            <tr><td colspan="7" class="p-4 text-slate-400">No incidents.</td></tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class IncidentsComponent implements OnInit {
  private api = inject(ApiService);

  all = signal<Incident[]>([]);
  trains = signal<FreightTrain[]>([]);
  status = signal('');
  severity = signal('');
  showForm = signal(false);
  error = signal('');
  severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  types = ['SIGNAL_FAILURE', 'TRACK_OBSTRUCTION', 'ENGINE_FAULT', 'BRAKE_FAILURE', 'WEATHER', 'CARGO_DAMAGE', 'OVERHEAD_WIRE'];

  filtered = computed(() =>
    this.all().filter(
      (i) => (!this.status() || i.status === this.status()) &&
             (!this.severity() || i.severity === this.severity()),
    ),
  );

  form = this.blank();

  private blank() {
    return {
      trainId: null as number | null,
      incidentType: 'SIGNAL_FAILURE',
      severity: 'MEDIUM',
      description: '',
      incidentTime: '',
      status: 'OPEN',
    };
  }

  ngOnInit() {
    this.load();
    this.api.getTrains().subscribe((d) => this.trains.set(d));
  }

  load() { this.api.getIncidents().subscribe((d) => this.all.set(d)); }

  save() {
    this.error.set('');
    const f = this.form;
    const body: IncidentRequest = {
      trainId: f.trainId!,
      incidentType: f.incidentType,
      severity: f.severity,
      description: f.description,
      incidentTime: f.incidentTime,
      status: f.status,
    };
    this.api.createIncident(body).subscribe({
      next: () => { this.form = this.blank(); this.showForm.set(false); this.load(); },
      error: () => this.error.set('Could not save incident. Check the backend console for details.'),
    });
  }
}