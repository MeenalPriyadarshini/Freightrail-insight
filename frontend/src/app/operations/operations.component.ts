import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { FreightTrain, OperationLog, OperationLogRequest, Shipment } from '../core/models';
import { emptyToNull, nowLocal } from '../core/utils';

@Component({
  selector: 'app-operations',
  imports: [DatePipe, FormsModule],
  template: `
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold">Operation Logs</h1>
      <button class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700" (click)="showForm.set(!showForm())">
        {{ showForm() ? 'Close' : '+ New Operation' }}
      </button>
    </div>

    @if (showForm()) {
      <form #f="ngForm" (ngSubmit)="save()" class="mb-6 grid gap-3 rounded-lg bg-white p-4 shadow md:grid-cols-4">
        <label class="text-sm">Train
          <select class="mt-1 w-full rounded border p-2" name="train" [(ngModel)]="form.trainId" required>
            <option [ngValue]="null" disabled>Select…</option>
            @for (t of trains(); track t.trainId) { <option [ngValue]="t.trainId">{{ t.trainNumber }} – {{ t.trainName }}</option> }
          </select>
        </label>
        <label class="text-sm">Shipment (optional)
          <select class="mt-1 w-full rounded border p-2" name="shipment" [(ngModel)]="form.shipmentId">
            <option [ngValue]="null">None</option>
            @for (s of shipments(); track s.shipmentId) {
              <option [ngValue]="s.shipmentId">#{{ s.shipmentId }} – {{ s.customer?.companyName }} – {{ s.cargoType }}</option>
            }
          </select>
        </label>
        <label class="text-sm">Event type
          <select class="mt-1 w-full rounded border p-2" name="event" [(ngModel)]="form.eventType" required>
            @for (e of eventTypes; track e) { <option>{{ e }}</option> }
          </select>
        </label>
        <label class="text-sm">Delay (min, auto if blank)
          <input class="mt-1 w-full rounded border p-2" type="number" min="0" name="delay" [(ngModel)]="form.delayMinutes" />
        </label>
        <label class="text-sm">Scheduled time
          <input class="mt-1 w-full rounded border p-2" type="datetime-local" name="sched" [(ngModel)]="form.scheduledTime" required />
        </label>
        <label class="text-sm">Actual time
          <input class="mt-1 w-full rounded border p-2" type="datetime-local" name="actual" [(ngModel)]="form.actualTime" />
        </label>
        <div class="flex items-end md:col-span-2">
          <button [disabled]="f.invalid" class="rounded bg-green-600 px-5 py-2 text-white hover:bg-green-700 disabled:opacity-40">
            Save operation
          </button>
        </div>
      </form>
    }

    @if (error()) { <div class="mb-4 rounded bg-red-100 p-3 text-red-700">{{ error() }}</div> }

    <div class="overflow-x-auto rounded-lg bg-white shadow">
      <table class="w-full text-left text-sm">
        <thead class="border-b bg-slate-50 text-slate-500">
          <tr><th class="p-3">#</th><th>Train</th><th>Shipment</th><th>Event</th><th>Scheduled</th><th>Actual</th><th>Delay (min)</th></tr>
        </thead>
        <tbody>
          @for (o of ops(); track o.operationId) {
            <tr class="border-b last:border-0">
              <td class="p-3">{{ o.operationId }}</td>
              <td>{{ o.train?.trainNumber }}</td>
              <td>{{ o.shipment?.shipmentId }}</td>
              <td>{{ o.eventType }}</td>
              <td>{{ o.scheduledTime | date: 'dd MMM, HH:mm' }}</td>
              <td>{{ o.actualTime | date: 'dd MMM, HH:mm' }}</td>
              <td [class]="o.delayMinutes >= 60 ? 'font-semibold text-red-600' : 'text-amber-600'">{{ o.delayMinutes }}</td>
            </tr>
          } @empty {
            <tr><td colspan="7" class="p-4 text-slate-400">No operations logged.</td></tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class OperationsComponent implements OnInit {
  private api = inject(ApiService);

  ops = signal<OperationLog[]>([]);
  trains = signal<FreightTrain[]>([]);
  shipments = signal<Shipment[]>([]);
  showForm = signal(false);
  error = signal('');
  eventTypes = ['DEPARTURE', 'CHECKPOINT', 'ARRIVAL'];

  form = this.blank();

  private blank() {
    return {
      trainId: null as number | null,
      shipmentId: null as number | null,
      eventType: 'DEPARTURE',
      scheduledTime: '',
      actualTime: '',
      delayMinutes: null as number | null,
    };
  }

  ngOnInit() {
    this.load();
    this.api.getTrains().subscribe((d) => this.trains.set(d));
    this.api.getShipments().subscribe((d) => this.shipments.set(d));
  }

  load() { this.api.getOperations().subscribe((d) => this.ops.set(d)); }

  save() {
    this.error.set('');
    const f = this.form;
    let delay = f.delayMinutes;
    if (delay === null && f.actualTime) {
      const diff = (new Date(f.actualTime).getTime() - new Date(f.scheduledTime).getTime()) / 60000;
      delay = Math.max(0, Math.round(diff));
    }
    const body: OperationLogRequest = {
      trainId: f.trainId!,
      shipmentId: f.shipmentId,
      eventType: f.eventType,
      scheduledTime: f.scheduledTime,
      actualTime: emptyToNull(f.actualTime),
      delayMinutes: delay,
      recordedAt: nowLocal(),
    };
    this.api.createOperation(body).subscribe({
      next: () => { this.form = this.blank(); this.showForm.set(false); this.load(); },
      error: () => this.error.set('Could not save operation. Check the backend console for details.'),
    });
  }
}