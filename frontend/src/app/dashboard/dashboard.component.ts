import { Component, OnInit, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { ApiService } from '../core/api.service';
import { DashboardSummary, DelayedTrain } from '../core/models';

@Component({
  selector: 'app-dashboard',
  imports: [BaseChartDirective],
  template: `
    <h1 class="mb-6 text-2xl font-bold">Operations Dashboard</h1>

    @if (error()) {
      <div class="mb-4 rounded bg-red-100 p-3 text-red-700">{{ error() }}</div>
    }

    @if (summary(); as s) {
      <div class="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        @for (c of cards(s); track c.label) {
          <div class="rounded-lg bg-white p-4 shadow">
            <div class="text-sm text-slate-500">{{ c.label }}</div>
            <div class="mt-1 text-3xl font-bold" [class]="c.color">{{ c.value }}</div>
          </div>
        }
      </div>
    } @else if (!error()) {
      <p class="text-slate-500">Loading…</p>
    }

    <div class="grid gap-6 lg:grid-cols-2">
      <div class="rounded-lg bg-white p-4 shadow">
        <h2 class="mb-3 font-semibold">Shipments by Status</h2>
        <div class="mx-auto h-64 max-w-xs">
          <canvas baseChart [data]="statusData()" [options]="doughnutOptions" type="doughnut"></canvas>
        </div>
      </div>

      <div class="rounded-lg bg-white p-4 shadow">
        <h2 class="mb-3 font-semibold">Incidents by Severity</h2>
        <div class="h-64">
          <canvas baseChart [data]="severityData()" [options]="barOptions" type="bar"></canvas>
        </div>
      </div>

      <div class="rounded-lg bg-white p-4 shadow lg:col-span-2">
        <h2 class="mb-3 font-semibold">Delayed Trains</h2>
        <table class="w-full text-left text-sm">
          <thead class="border-b text-slate-500">
            <tr><th class="py-2">Train</th><th>Name</th><th>Delay (min)</th></tr>
          </thead>
          <tbody>
            @for (t of delayed(); track t.trainId) {
              <tr class="border-b last:border-0">
                <td class="py-2 font-medium">{{ t.trainNumber }}</td>
                <td>{{ t.trainName }}</td>
                <td [class]="t.delayMinutes >= 60 ? 'font-semibold text-red-600' : 'text-amber-600'">
                  {{ t.delayMinutes }}
                </td>
              </tr>
            } @empty {
              <tr><td colspan="3" class="py-3 text-slate-400">No delays recorded 🎉</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);

  summary = signal<DashboardSummary | null>(null);
  delayed = signal<DelayedTrain[]>([]);
  error = signal('');
  statusData = signal<ChartData<'doughnut'>>({ labels: [], datasets: [{ data: [] }] });
  severityData = signal<ChartData<'bar'>>({ labels: [], datasets: [{ data: [] }] });

  doughnutOptions: ChartOptions<'doughnut'> = { responsive: true, maintainAspectRatio: false };
  barOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
  };

  cards(s: DashboardSummary) {
    return [
      { label: 'Total Trains', value: s.totalTrains, color: '' },
      { label: 'Active Trains', value: s.activeTrains, color: 'text-green-600' },
      { label: 'In Maintenance', value: s.maintenanceTrains, color: 'text-amber-600' },
      { label: 'Total Shipments', value: s.totalShipments, color: '' },
      { label: 'Delayed Shipments', value: s.delayedShipments, color: 'text-amber-600' },
      { label: 'Open Incidents', value: s.openIncidents, color: 'text-red-600' },
    ];
  }

  ngOnInit() {
    forkJoin({
      summary: this.api.getSummary(),
      delayed: this.api.getDelayedTrains(),
      status: this.api.getShipmentStatus(),
      severity: this.api.getIncidentSeverity(),
    }).subscribe({
      next: ({ summary, delayed, status, severity }) => {
        this.summary.set(summary);
        this.delayed.set(delayed);
        this.statusData.set({
          labels: status.map((s) => s.status),
          datasets: [{
            data: status.map((s) => s.count),
            backgroundColor: ['#3b82f6', '#f59e0b', '#10b981', '#6366f1', '#94a3b8'],
          }],
        });
        const sevColors: Record<string, string> = {
          LOW: '#10b981', MEDIUM: '#3b82f6', HIGH: '#ef4444', CRITICAL: '#7f1d1d',
        };
        const keys = Object.keys(severity);
        this.severityData.set({
          labels: keys,
          datasets: [{
            data: keys.map((k) => severity[k]),
            backgroundColor: keys.map((k) => sevColors[k] ?? '#94a3b8'),
          }],
        });
      },
      error: () =>
        this.error.set('Could not load dashboard. Is the Spring Boot backend running on :8082?'),
    });
  }
}
