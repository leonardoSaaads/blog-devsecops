export type Who = "owner" | "group" | "others";
export type Permission = "read" | "write" | "execute";

export interface Triad {
  read: boolean;
  write: boolean;
  execute: boolean;
}

export interface Mode {
  owner: Triad;
  group: Triad;
  others: Triad;
  special: { setuid: boolean; setgid: boolean; sticky: boolean };
}

export const WHO: Who[] = ["owner", "group", "others"];
export const PERMISSIONS: Permission[] = ["read", "write", "execute"];

const BIT: Record<Permission, number> = { read: 4, write: 2, execute: 1 };

function triadToDigit(triad: Triad): number {
  return PERMISSIONS.reduce((sum, perm) => sum + (triad[perm] ? BIT[perm] : 0), 0);
}

function digitToTriad(digit: number): Triad {
  return { read: (digit & 4) !== 0, write: (digit & 2) !== 0, execute: (digit & 1) !== 0 };
}

export function modeToNumber(mode: Mode): number {
  const special =
    (mode.special.setuid ? 4 : 0) + (mode.special.setgid ? 2 : 0) + (mode.special.sticky ? 1 : 0);
  return (
    (special << 9) |
    (triadToDigit(mode.owner) << 6) |
    (triadToDigit(mode.group) << 3) |
    triadToDigit(mode.others)
  );
}

export function numberToMode(value: number): Mode {
  const special = (value >> 9) & 7;
  return {
    owner: digitToTriad((value >> 6) & 7),
    group: digitToTriad((value >> 3) & 7),
    others: digitToTriad(value & 7),
    special: {
      setuid: (special & 4) !== 0,
      setgid: (special & 2) !== 0,
      sticky: (special & 1) !== 0,
    },
  };
}

/** "0750" → modo; aceita 3 ou 4 dígitos octais. Retorna `null` se inválido. */
export function parseOctal(text: string): Mode | null {
  const trimmed = text.trim();
  if (!/^[0-7]{3,4}$/.test(trimmed)) return null;
  return numberToMode(Number.parseInt(trimmed, 8));
}

/** Representação octal: 3 dígitos, ou 4 quando há bits especiais. */
export function modeToOctal(mode: Mode): string {
  const value = modeToNumber(mode);
  return value > 0o777 ? value.toString(8).padStart(4, "0") : value.toString(8).padStart(3, "0");
}

/** Representação de `ls -l`, incluindo s/S (setuid/setgid) e t/T (sticky). */
export function modeToSymbolic(mode: Mode, type: "file" | "directory" = "file"): string {
  const triad = (t: Triad, special: boolean, specialChar: "s" | "t") =>
    `${t.read ? "r" : "-"}${t.write ? "w" : "-"}${
      special ? (t.execute ? specialChar : specialChar.toUpperCase()) : t.execute ? "x" : "-"
    }`;
  return (
    (type === "directory" ? "d" : "-") +
    triad(mode.owner, mode.special.setuid, "s") +
    triad(mode.group, mode.special.setgid, "s") +
    triad(mode.others, mode.special.sticky, "t")
  );
}

/** Comando simbólico equivalente: `u=rwx,g=rx,o=`. */
export function modeToChmodSymbolic(mode: Mode): string {
  const letters = (t: Triad) => `${t.read ? "r" : ""}${t.write ? "w" : ""}${t.execute ? "x" : ""}`;
  return `u=${letters(mode.owner)},g=${letters(mode.group)},o=${letters(mode.others)}`;
}

export interface PermissionWarning {
  level: "danger" | "warning" | "info";
  message: string;
}

export function permissionWarnings(mode: Mode): PermissionWarning[] {
  const warnings: PermissionWarning[] = [];
  const value = modeToNumber(mode) & 0o777;
  if (value === 0o777) {
    warnings.push({
      level: "danger",
      message: "777: qualquer usuário do sistema pode ler, alterar e executar.",
    });
  } else if (mode.others.write) {
    warnings.push({
      level: "danger",
      message:
        "Escrita para “outros” (world-writable): qualquer conta local pode modificar o arquivo.",
    });
  }
  if (mode.special.setuid) {
    warnings.push({
      level: "warning",
      message:
        "setuid: o executável roda com os privilégios do dono — alvo clássico de escalonamento.",
    });
  }
  if (mode.group.write && !mode.others.write) {
    warnings.push({
      level: "info",
      message: "Grupo com escrita: garanta que apenas contas confiáveis pertençam ao grupo.",
    });
  }
  return warnings;
}

/**
 * Aplica a umask: permissões = base AND (NOT umask).
 * Não é subtração: com umask 033, um arquivo (666) resulta em 644, e não 633.
 */
export function applyUmask(umask: string, kind: "file" | "directory"): number {
  if (!/^0?[0-7]{3}$/.test(umask.trim())) throw new Error(`umask inválida: ${umask}`);
  const mask = Number.parseInt(umask.trim(), 8);
  const base = kind === "file" ? 0o666 : 0o777;
  return base & ~mask & 0o777;
}

export function toOctalString(value: number): string {
  return value.toString(8).padStart(3, "0");
}
