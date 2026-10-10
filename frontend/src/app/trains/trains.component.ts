import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { FreightTrain } from '../core/models';
import { StatusBadgeComponent } from '../shared/status-badge.component';

const EMPTY: FreightTrain = { trainNumber: '', trainName: '', capacityTons: 0, status: 'ACTIVE' };

@Component({
  selector: 'app-trains',
  imports: [FormsModule, StatusBadgeComponent],
  template: `
    <h1 class="mb-6 text-2xl font-bold">Freight Trains</h1>

    <form (ngSubmit)="save()" class="mb-6 grid gap-3 rounded-lg bg-white p-4 shadow md:grid-cols-5">
      <input class="rounded border p-2" placeholder="Train number" name="num" [(ngModel)]="form.trainNumber" required />
      <input class="rounded border p-2" placeholder="Train name" name="name" [(ngModel)]="form.trainName" required />
      <input class="rounded border p-2" type="number" placeholder="Capacity (tons)" name="cap" [(ngModel)]="form.capacityTons" required />
      <select class="rounded border p-2" name="status" [(ngModel)]="form.status">
        <option>ACTIVE</option>
        <option>MAINTENANCE</option>
        <option>INACTIVE</option>
      </select>
      <div class="flex gap-2">
        <button class="flex-1 rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700">
          {{ editingId() ? 'Update' : 'Add' }}
        </button>
        @if (editingId()) {
          <button type="button" (click)="reset()" class="rounded border px-3 py-2">Cancel</button>
        }
      </div>
    </form>

    @if (error()) { <div class="mb-4 rounded bg-red-100 p-3 text-red-700">{{ error() }}</div> }

    <div class="overflow-x-auto rounded-lg bg-white shadow">
      <table class="w-full text-left text-sm">
        <thead class="border-b bg-slate-50 text-slate-500">
          <tr><th class="p-3">Number</th><th>Name</th><th>Capacity (t)</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          @for (t of trains(); track t.trainId) {
            <tr class="border-b last:border-0">
              <td class="p-3 font-medium">{{ t.trainNumber }}</td>
              <td>{{ t.trainName }}</td>
              <td>{{ t.capacityTons }}</td>
              <td><app-status-badge [value]="t.status" /></td>
              <td><button class="text-blue-600 hover:underline" (click)="edit(t)">Edit</button></td>
            </tr>
          } @empty {
            <tr><td colspan="5" class="p-4 text-slate-400">No trains found.</td></tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class TrainsComponent implements OnInit {
  private api = inject(ApiService);
  trains = signal<FreightTrain[]>([]);
  editingId = signal<number | null>(null);
  error = signal('');
  form: FreightTrain = { ...EMPTY };

  ngOnInit() { this.load(); }

  load() {
    this.api.getTrains().subscribe({
      next: (t) => this.trains.set(t),
      error: () => this.error.set('Failed to load trains.'),
    });
  }

  edit(t: FreightTrain) {
    this.editingId.set(t.trainId ?? null);
    this.form = { ...t };
  }

  reset() {
    this.editingId.set(null);
    this.form = { ...EMPTY };
  }

  save() {
    this.error.set('');
    const id = this.editingId();
    const req = id ? this.api.updateTrain(id, this.form) : this.api.createTrain(this.form);
    req.subscribe({
      next: () => { this.reset(); this.load(); },
      error: () => this.error.set('Save failed (duplicate train number?).'),
    });
  }
}