import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  template: `<span class="rounded-full px-2.5 py-0.5 text-xs font-semibold" [class]="color()">{{ value() }}</span>`,
})
export class StatusBadgeComponent {
  value = input.required<string>();

  color = computed(() => {
    switch (this.value()?.toUpperCase()) {
      case 'ACTIVE': case 'DELIVERED': case 'RESOLVED': case 'LOW':
        return 'bg-green-100 text-green-700';
      case 'IN_TRANSIT': case 'PLANNED': case 'MEDIUM': case 'OPEN':
        return 'bg-blue-100 text-blue-700';
      case 'DELAYED': case 'MAINTENANCE':
        return 'bg-amber-100 text-amber-700';
      case 'HIGH': case 'CRITICAL':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-200 text-slate-700';
    }
  });
}