import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex min-h-screen bg-slate-100 text-slate-800">
      <aside class="w-60 shrink-0 bg-slate-900 text-slate-300 flex flex-col">
        <div class="px-5 py-5 text-lg font-bold text-white">🚂 FreightRail Insight</div>
        <nav class="flex flex-col gap-1 px-3">
          @for (l of links; track l.path) {
            <a
              [routerLink]="l.path"
              routerLinkActive="!bg-slate-700 !text-white"
              class="rounded px-3 py-2 hover:bg-slate-800"
            >
              {{ l.icon }} {{ l.label }}
            </a>
          }
        </nav>
      </aside>
      <main class="flex-1 overflow-auto p-6">
        <router-outlet />
      </main>
    </div>
  `,
})
export class App {
  links = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/trains', label: 'Trains', icon: '🚆' },
    { path: '/shipments', label: 'Shipments', icon: '📦' },
    { path: '/operations', label: 'Operations', icon: '⏱️' },
    { path: '/incidents', label: 'Incidents', icon: '⚠️' },
  ];
}