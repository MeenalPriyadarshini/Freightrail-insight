import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { Customer, FreightTrain, Shipment, ShipmentRequest, Station } from '../core/models';
import { emptyToNull } from '../core/utils';
import { StatusBadgeComponent } from '../shared/status-badge.component';

@Component({
  selector: 'app-shipments',
  imports: [DatePipe, FormsModule, StatusBadgeComponent],
  template: `
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold">Shipments</h1>
      <div class="flex gap-2">
        <select class="rounded border bg-white p-2" (change)="filter.set($any($event.target).value)">
          <option value="">All statuses</option>
          @for (s of statuses; track s) { <option [value]="s">{{ s }}</option> }
        </select>
        <button class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700" (click)="showForm.set(!showForm())">
          {{ showForm() ? 'Close' : '+ New Shipment' }}
        </button>
      </div>
    </div>

    @if (showForm()) {
      <form #f="ngForm" (ngSubmit)="save()" class="mb-6 grid gap-3 rounded-lg bg-white p-4 shadow md:grid-cols-4">
        <label class="text-sm">Customer
          <select class="mt-1 w-full rounded border p-2" name="customer" [(ngModel)]="form.customerId" required>
            <option [ngValue]="null" disabled>Select…</option>
            @for (c of customers(); track c.customerId) { <option [ngValue]="c.customerId">{{ c.companyName }}</option> }
          </select>
        </label>
        <label class="text-sm">Train
          <select class="mt-1 w-full rounded border p-2" name="train" [(ngModel)]="form.trainId">
            <option [ngValue]="null">Unassigned</option>
            @for (t of trains(); track t.trainId) { <option [ngValue]="t.trainId">{{ t.trainNumber }} – {{ t.trainName }}</option> }
          </select>
        </label>
        <label class="text-sm">Cargo type
          <input class="mt-1 w-full rounded border p-2" name="cargo" [(ngModel)]="form.cargoType" required />
        </label>
        <label class="text-sm">Weight (tons)
          <input class="mt-1 w-full rounded border p-2" type="number" min="1" name="weight" [(ngModel)]="form.weightTons" required />
        </label>
        <label class="text-sm">Origin
          <select class="mt-1 w-full rounded border p-2" name="origin" [(ngModel)]="form.originStationId" required>
            <option [ngValue]="null" disabled>Select…</option>
            @for (s of stations(); track s.stationId) { <option [ngValue]="s.stationId">{{ s.stationName }} ({{ s.stationCode }})</option> }
          </select>
        </label>
        <label class="text-sm">Destination
          <select class="mt-1 w-full rounded border p-2" name="dest" [(ngModel)]="form.destinationStationId" required>
            <option [ngValue]="null" disabled>Select…</option>
            @for (s of stations(); track s.stationId) { <option [ngValue]="s.stationId">{{ s.stationName }} ({{ s.stationCode }})</option> }
          </select>
        </label>
        <label class="text-sm">Shipment date
          <input class="mt-1 w-full rounded border p-2" type="date" name="sdate" [(ngModel)]="form.shipmentDate" required />
        </label>
        <label class="text-sm">Expected delivery
          <input class="mt-1 w-full rounded border p-2" type="datetime-local" name="exp" [(ngModel)]="form.expectedDelivery" required />
        </label>
        <label class="text-sm">Actual delivery (optional)
          <input class="mt-1 w-full rounded border p-2" type="datetime-local" name="act" [(ngModel)]="form.actualDelivery" />
        </label>
        <label class="text-sm">Status
          <select class="mt-1 w-full rounded border p-2" name="status" [(ngModel)]="form.status">
            @for (s of statuses; track s) { <option>{{ s }}</option> }
          </select>
        </label>
        <div class="flex items-end md:col-span-2">
          <button [disabled]="f.invalid" class="rounded bg-green-600 px-5 py-2 text-white hover:bg-green-700 disabled:opacity-40">
            Save shipment
          </button>
        </div>
      </form>
    }

    @if (error()) { <div class="mb-4 rounded bg-red-100 p-3 text-red-700">{{ error() }}</div> }

    <div class="overflow-x-auto rounded-lg bg-white shadow">
      <table class="w-full text-left text-sm">
        <thead class="border-b bg-slate-50 text-slate-500">
          <tr>
            <th class="p-3">#</th><th>Customer</th><th>Train</th><th>Cargo</th><th>Weight (t)</th>
            <th>Route</th><th>Expected</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          @for (s of filtered(); track s.shipmentId) {
            <tr class="border-b last:border-0">
              <td class="p-3">{{ s.shipmentId }}</td>
              <td>{{ s.customer?.companyName }}</td>
              <td>{{ s.train?.trainNumber }}</td>
              <td>{{ s.cargoType }}</td>
              <td>{{ s.weightTons }}</td>
              <td>{{ s.originStation?.stationName }} → {{ s.destinationStation?.stationName }}</td>
              <td>{{ s.expectedDelivery | date: 'dd MMM, HH:mm' }}</td>
              <td><app-status-badge [value]="s.status" /></td>
            </tr>
          } @empty {
            <tr><td colspan="8" class="p-4 text-slate-400">No shipments.</td></tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class ShipmentsComponent implements OnInit {
  private api = inject(ApiService);

  all = signal<Shipment[]>([]);
  customers = signal<Customer[]>([]);
  stations = signal<Station[]>([]);
  trains = signal<FreightTrain[]>([]);
  filter = signal('');
  showForm = signal(false);
  error = signal('');
  statuses = ['PLANNED', 'IN_TRANSIT', 'DELAYED', 'DELIVERED'];
  filtered = computed(() => this.all().filter((s) => !this.filter() || s.status === this.filter()));

  form = this.blank();

  private blank() {
    return {
      customerId: null as number | null,
      trainId: null as number | null,
      cargoType: '',
      weightTons: null as number | null,
      originStationId: null as number | null,
      destinationStationId: null as number | null,
      shipmentDate: '',
      expectedDelivery: '',
      actualDelivery: '',
      status: 'PLANNED',
    };
  }

  ngOnInit() {
    this.load();
    this.api.getCustomers().subscribe((d) => this.customers.set(d));
    this.api.getStations().subscribe((d) => this.stations.set(d));
    this.api.getTrains().subscribe((d) => this.trains.set(d));
  }

  load() { this.api.getShipments().subscribe((d) => this.all.set(d)); }

  save() {
    this.error.set('');
    const f = this.form;
    if (f.originStationId === f.destinationStationId) {
      this.error.set('Origin and destination must be different.');
      return;
    }
    const body: ShipmentRequest = {
      customerId: f.customerId!,
      trainId: f.trainId,
      cargoType: f.cargoType,
      weightTons: f.weightTons!,
      originStationId: f.originStationId!,
      destinationStationId: f.destinationStationId!,
      shipmentDate: f.shipmentDate,
      expectedDelivery: f.expectedDelivery,
      actualDelivery: emptyToNull(f.actualDelivery),
      status: f.status,
    };
    this.api.createShipment(body).subscribe({
      next: () => { this.form = this.blank(); this.showForm.set(false); this.load(); },
      error: () => this.error.set('Could not save shipment. Check the backend console for details.'),
    });
  }
}