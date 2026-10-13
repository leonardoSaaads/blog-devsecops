const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  // Datas ISO (AAAA-MM-DD) são meia-noite UTC; sem fixar o fuso, no Brasil
  // (UTC-3) a data exibida seria o dia anterior.
  timeZone: "UTC",
});

const shortDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDate(isoDate: string): string {
  return dateFormatter.format(new Date(`${isoDate}T00:00:00Z`));
}

export function formatShortDate(isoDate: string): string {
  return shortDateFormatter.format(new Date(`${isoDate}T00:00:00Z`)).replace(/\./g, "");
}

export function formatReadingTime(minutes: number): string {
  return `${minutes} min de leitura`;
}

export function formatCurrency(amountInCents: number, currency = "BRL"): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(
    amountInCents / 100,
  );
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
