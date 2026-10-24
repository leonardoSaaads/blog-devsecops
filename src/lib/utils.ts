/** Junta classes CSS condicionais (valores falsy são descartados). */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
