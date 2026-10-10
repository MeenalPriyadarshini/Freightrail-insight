/** Current local time as "2026-10-09T14:30:00", which Spring's LocalDateTime accepts. */
export function nowLocal(): string {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 19);
}

export const emptyToNull = (v: string | null | undefined): string | null => (v ? v : null);