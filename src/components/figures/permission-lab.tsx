"use client";

import { ShieldAlert } from "lucide-react";
import { useId, useState } from "react";
import { cn } from "@/lib/utils";
import {
  PERMISSIONS,
  WHO,
  applyUmask,
  modeToChmodSymbolic,
  modeToOctal,
  modeToSymbolic,
  parseOctal,
  permissionWarnings,
  toOctalString,
  type Mode,
  type Permission,
  type Who,
} from "@/lib/simulations/permissions";
import { InteractiveFigure, controlToggle } from "./interactive-figure";

const WHO_LABEL: Record<Who, string> = {
  owner: "Owner (u)",
  group: "Group (g)",
  others: "Others (o)",
};
const PERM_LABEL: Record<Permission, string> = {
  read: "Read (r=4)",
  write: "Write (w=2)",
  execute: "Execute (x=1)",
};
const PRESETS = ["644", "755", "640", "750", "600", "700", "777", "4755"];

export function PermissionLab({ fileName = "deploy.sh" }: { fileName?: string }) {
  const [mode, setMode] = useState<Mode>(() => parseOctal("750")!);
  const [octalInput, setOctalInput] = useState("750");
  const [type, setType] = useState<"file" | "directory">("file");
  const [umask, setUmask] = useState("022");
  const octalId = useId();
  const umaskId = useId();

  const octal = modeToOctal(mode);
  const warnings = permissionWarnings(mode);
  const octalInvalid = parseOctal(octalInput) === null;
  const umaskValid = /^0?[0-7]{3}$/.test(umask.trim());

  const updateMode = (next: Mode) => {
    setMode(next);
    setOctalInput(modeToOctal(next));
  };

  const toggle = (who: Who, perm: Permission) =>
    updateMode({ ...mode, [who]: { ...mode[who], [perm]: !mode[who][perm] } });

  const toggleSpecial = (key: keyof Mode["special"]) =>
    updateMode({ ...mode, special: { ...mode.special, [key]: !mode.special[key] } });

  return (
    <InteractiveFigure
      title="Permission (chmod) and umask calculator"
      description="Tick the permissions and watch the octal mode, the ls -l output and the security risks update in real time."
      testId="permission-lab"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <table className="w-full border-separate border-spacing-1 text-sm">
            <caption className="sr-only">Permission matrix</caption>
            <thead>
              <tr>
                <th scope="col" className="text-left font-medium text-muted-foreground">
                  Class
                </th>
                {PERMISSIONS.map((perm) => (
                  <th
                    key={perm}
                    scope="col"
                    className="text-center text-xs font-medium text-muted-foreground"
                  >
                    {PERM_LABEL[perm]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {WHO.map((who) => (
                <tr key={who}>
                  <th scope="row" className="text-left font-medium">
                    {WHO_LABEL[who]}
                  </th>
                  {PERMISSIONS.map((perm) => (
                    <td key={perm} className="text-center">
                      <input
                        type="checkbox"
                        checked={mode[who][perm]}
                        onChange={() => toggle(who, perm)}
                        aria-label={`${WHO_LABEL[who]}: ${PERM_LABEL[perm]}`}
                        className="size-5 cursor-pointer accent-[var(--accent)]"
                        data-testid={`perm-${who}-${perm}`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <fieldset className="flex flex-wrap gap-4 text-sm">
            <legend className="mb-1 text-xs font-medium text-muted-foreground">Special bits</legend>
            {(["setuid", "setgid", "sticky"] as const).map((key) => (
              <label key={key} className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={mode.special[key]}
                  onChange={() => toggleSpecial(key)}
                  className="size-4 accent-[var(--accent)]"
                />
                <code className="font-mono">{key}</code>
              </label>
            ))}
          </fieldset>

          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label
                htmlFor={octalId}
                className="mb-1 block text-xs font-medium text-muted-foreground"
              >
                Octal mode
              </label>
              <input
                id={octalId}
                value={octalInput}
                inputMode="numeric"
                maxLength={4}
                onChange={(event) => {
                  setOctalInput(event.target.value);
                  const parsed = parseOctal(event.target.value);
                  if (parsed) setMode(parsed);
                }}
                aria-invalid={octalInvalid}
                aria-describedby={octalInvalid ? `${octalId}-error` : undefined}
                className={cn(
                  "h-10 w-24 rounded-lg border bg-background px-3 font-mono text-lg outline-none focus:ring-4 focus:ring-[var(--ring)]",
                  octalInvalid ? "border-danger" : "border-border",
                )}
                data-testid="octal-input"
              />
            </div>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Common modes">
              {PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => updateMode(parseOctal(preset)!)}
                  className={controlToggle(octal === preset, "px-2 py-1 font-mono text-xs")}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
          {octalInvalid && (
            <p id={`${octalId}-error`} className="text-sm text-danger">
              Use 3 or 4 digits between 0 and 7.
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex gap-2 text-sm" role="group" aria-label="Target type">
            {(["file", "directory"] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={type === value}
                onClick={() => setType(value)}
                className={controlToggle(type === value)}
              >
                {value === "file" ? "File" : "Directory"}
              </button>
            ))}
          </div>

          <div className="rounded-xl bg-code p-4 font-mono text-sm leading-7" aria-live="polite">
            <p className="text-muted-foreground">
              $ ls -l{type === "directory" ? "d" : ""} {fileName}
            </p>
            <p data-testid="ls-output">
              <span className="text-accent-strong">{modeToSymbolic(mode, type)}</span> 1 leo devops
              4096 Oct 13 10:00 {fileName}
            </p>
            <p className="mt-2 text-muted-foreground">
              $ chmod {octal} {fileName}
            </p>
            <p className="text-muted-foreground">
              $ chmod {modeToChmodSymbolic(mode)} {fileName}
            </p>
          </div>

          <ul className="space-y-2" aria-label="Security analysis">
            {warnings.length === 0 ? (
              <li className="rounded-lg border border-success/40 bg-success/10 px-3 py-2 text-sm">
                No obvious risk: the principle of least privilege is being respected.
              </li>
            ) : (
              warnings.map((warning) => (
                <li
                  key={warning.message}
                  className={cn(
                    "flex gap-2 rounded-lg border px-3 py-2 text-sm",
                    warning.level === "danger" && "border-danger/50 bg-danger/10",
                    warning.level === "warning" && "border-warning/50 bg-warning/10",
                    warning.level === "info" && "border-border bg-muted",
                  )}
                >
                  <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  {warning.message}
                </li>
              ))
            )}
          </ul>

          <div className="rounded-xl border border-border p-4">
            <label htmlFor={umaskId} className="text-sm font-medium">
              umask
            </label>
            <input
              id={umaskId}
              value={umask}
              onChange={(event) => setUmask(event.target.value)}
              maxLength={4}
              className="ml-3 h-9 w-20 rounded-lg border border-border bg-background px-2 font-mono outline-none focus:ring-4 focus:ring-[var(--ring)]"
              data-testid="umask-input"
            />
            {umaskValid ? (
              <dl
                className="mt-3 grid grid-cols-2 gap-3 font-mono text-sm"
                data-testid="umask-output"
              >
                <div>
                  <dt className="text-xs text-muted-foreground">new file (666 &amp; ~umask)</dt>
                  <dd>{toOctalString(applyUmask(umask, "file"))}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">
                    new directory (777 &amp; ~umask)
                  </dt>
                  <dd>{toOctalString(applyUmask(umask, "directory"))}</dd>
                </div>
              </dl>
            ) : (
              <p className="mt-2 text-sm text-danger">Enter 3 octal digits (e.g., 022).</p>
            )}
          </div>
        </div>
      </div>
    </InteractiveFigure>
  );
}
