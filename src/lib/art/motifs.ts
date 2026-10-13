import { gaussian, mulberry32 } from "@/lib/simulations/random";
import { ART_HEIGHT as H, ART_WIDTH as W, type Artwork, type Shape } from "./types";

type Random = () => number;
const PLATE: [string, string] = ["#0b1324", "#060a14"];

const fmt = (value: number) => Number(value.toFixed(1));
const between = (random: Random, min: number, max: number) => min + random() * (max - min);
const pick = <T>(random: Random, items: readonly T[]): T =>
  items[Math.floor(random() * items.length)]!;

/**
 * Polilinha compacta: primeiro ponto absoluto e os demais relativos ("l dx dy"),
 * calculados sobre coordenadas já arredondadas (sem acúmulo de erro). Corta o tamanho
 * do SVG pela metade em relação a "L x y" absolutos.
 */
function polyline(points: Array<[number, number]>): string {
  let previous: [number, number] = [0, 0];
  const parts: string[] = [];
  points.forEach(([x, y], index) => {
    const current: [number, number] = [fmt(x), fmt(y)];
    if (index === 0) parts.push(`M${current[0]} ${current[1]}l`);
    else parts.push(`${fmt(current[0] - previous[0])} ${fmt(current[1] - previous[1])}`);
    previous = current;
  });
  return points.length > 1
    ? parts.join(" ").replace("l ", "l")
    : `M${fmt(points[0]![0])} ${fmt(points[0]![1])}`;
}

/** Mapeia t ∈ [0, 1] para uma cor espectral (violeta → vermelho). */
export function spectralColor(t: number, lightness = 62): string {
  const hue = 265 - Math.min(1, Math.max(0, t)) * 265;
  return `hsl(${fmt(hue)}, 90%, ${lightness}%)`;
}

// ------------------------------------------------------------- DWDM: espectro
export function spectrum(random: Random): Artwork {
  const shapes: Shape[] = [];
  const channels = 64;
  const left = 70;
  const right = W - 70;
  const base = H * 0.86;
  const spacing = (right - left) / channels;
  const sigma = spacing * 0.26;

  for (let x = left; x <= right; x += spacing * 4) {
    shapes.push({
      kind: "path",
      d: `M${fmt(x)} 60L${fmt(x)} ${fmt(base)}`,
      stroke: "#8fb3ff",
      strokeWidth: 0.6,
      opacity: 0.12,
    });
  }
  // Piso de ruído ASE
  const noise: Array<[number, number]> = [];
  for (let x = left; x <= right; x += 6)
    noise.push([x, base - 14 - Math.abs(gaussian(random)) * 5 - 10 * Math.sin((x / W) * Math.PI)]);
  shapes.push({
    kind: "path",
    d: polyline(noise),
    stroke: "#7c8db5",
    strokeWidth: 1.2,
    opacity: 0.5,
  });

  for (let i = 0; i < channels; i++) {
    const center = left + spacing * (i + 0.5);
    const height =
      between(random, 0.6, 1) * H * 0.66 * (0.7 + 0.3 * Math.sin((i / channels) * Math.PI));
    const points: Array<[number, number]> = [];
    for (let k = -14; k <= 14; k++) {
      const dx = (k / 14) * sigma * 4;
      points.push([center + dx, base - 20 - height * Math.exp(-(dx * dx) / (2 * sigma * sigma))]);
    }
    const color = spectralColor(i / (channels - 1));
    const d = polyline(points);
    shapes.push({
      kind: "path",
      d: `${d}L${fmt(center + sigma * 4)} ${fmt(base)}L${fmt(center - sigma * 4)} ${fmt(base)}Z`,
      fill: color,
      opacity: 0.16,
    });
    shapes.push({
      kind: "path",
      d,
      stroke: color,
      strokeWidth: 1.6,
      opacity: 0.95,
      className: i % 7 === 0 ? "art-shimmer" : undefined,
    });
  }
  shapes.push({
    kind: "path",
    d: `M${left} ${fmt(base)}L${right} ${fmt(base)}`,
    stroke: "#c9d6ff",
    strokeWidth: 1,
    opacity: 0.4,
  });

  return {
    motif: "spectrum",
    width: W,
    height: H,
    background: PLATE,
    glow: { color: "#3b2a7a", cx: 0.5, cy: 0.6 },
    shapes,
    caption: "Arte generativa: 64 canais ópticos de um grid DWDM sobre o piso de ruído ASE.",
  };
}

// ------------------------------------------------------------- K8s: malha hexagonal
export function lattice(random: Random): Artwork {
  const shapes: Shape[] = [];
  const size = 34;
  const w = Math.sqrt(3) * size;
  const h = 1.5 * size;
  const cells: Array<{ x: number; y: number; state: number }> = [];
  for (let row = -1; row < H / h + 1; row++) {
    for (let col = -1; col < W / w + 1; col++) {
      const x = col * w + (row % 2 ? w / 2 : 0);
      const y = row * h;
      const distance = Math.hypot((x - W * 0.62) / W, (y - H * 0.45) / H);
      const occupancy = Math.max(0, 0.95 - distance * 1.6);
      cells.push({ x, y, state: random() < occupancy ? (random() < 0.08 ? 2 : 1) : 0 });
    }
  }
  const hex = (cx: number, cy: number, r: number) =>
    `${Array.from({ length: 6 }, (_, i) => {
      const angle = (Math.PI / 3) * i + Math.PI / 6;
      return `${i === 0 ? "M" : "L"}${fmt(cx + r * Math.cos(angle))} ${fmt(cy + r * Math.sin(angle))}`;
    }).join("")}Z`;

  const active = cells.filter((cell) => cell.state > 0);
  for (const a of active) {
    for (const b of active) {
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (a !== b && a.x < b.x && d < w * 1.05 && random() < 0.35) {
        shapes.push({
          kind: "path",
          d: `M${fmt(a.x)} ${fmt(a.y)}L${fmt(b.x)} ${fmt(b.y)}`,
          stroke: "#4fd1ff",
          strokeWidth: 1,
          opacity: 0.25,
        });
      }
    }
  }
  for (const cell of cells) {
    if (cell.state === 0) {
      shapes.push({
        kind: "path",
        d: hex(cell.x, cell.y, size - 3),
        stroke: "#5470a8",
        strokeWidth: 1,
        opacity: 0.18,
      });
    } else {
      const terminating = cell.state === 2;
      shapes.push({
        kind: "path",
        d: hex(cell.x, cell.y, size - 4),
        fill: terminating ? "#f5a524" : "#1f6feb",
        opacity: terminating ? 0.55 : between(random, 0.18, 0.42),
        stroke: terminating ? "#ffcf70" : "#61dafb",
        strokeWidth: 1.4,
        className: terminating ? "art-pulse" : undefined,
      });
      shapes.push({
        kind: "circle",
        cx: fmt(cell.x),
        cy: fmt(cell.y),
        r: 3.2,
        fill: terminating ? "#ffe2a8" : "#bfeaff",
        opacity: 0.9,
      });
    }
  }
  return {
    motif: "lattice",
    width: W,
    height: H,
    background: ["#0a1430", "#050a18"],
    glow: { color: "#0f4fa8", cx: 0.62, cy: 0.45 },
    shapes,
    caption:
      "Arte generativa: malha hexagonal de nós e pods; em âmbar, pods em encerramento sendo reconciliados.",
  };
}

// ------------------------------------------------------------- Linux: bits de permissão
export function bits(random: Random): Artwork {
  const shapes: Shape[] = [];
  const cells: Shape[] = [];
  const cell = 14;
  const gap = 4;
  const groupGap = 12;
  const rowHeight = cell + 10;
  const blockWidth = 9 * (cell + gap) + 2 * groupGap + 40;
  for (let y = 40; y < H - 30; y += rowHeight) {
    for (let x = 40 - ((y / rowHeight) % 2) * 60; x < W - 20; x += blockWidth) {
      const mode = pick(random, [0o755, 0o644, 0o750, 0o600, 0o700, 0o640, 0o777, 0o711]);
      const danger = mode === 0o777;
      for (let bit = 0; bit < 9; bit++) {
        const set = ((mode >> (8 - bit)) & 1) === 1;
        const bx = x + bit * (cell + gap) + Math.floor(bit / 3) * groupGap;
        if (bx > W) continue;
        const fade = 0.35 + 0.65 * Math.exp(-(((y - H * 0.5) / (H * 0.55)) ** 2));
        cells.push({
          kind: "rect",
          x: fmt(bx),
          y: fmt(y),
          w: cell,
          h: cell,
          fill: set ? (danger ? "#ff6b6b" : bit % 3 === 2 ? "#f2c94c" : "#3ddc97") : "#1d2b3f",
          // Opacidade em passos de 0,05: imperceptível e permite agrupar células iguais.
          opacity: Math.round((set ? between(random, 0.55, 0.95) : 0.55) * fade * 20) / 20,
          className: set && random() < 0.015 ? "art-blink" : undefined,
        });
      }
    }
  }
  // Células não se sobrepõem: ordenar por pintura não muda a imagem e deixa o SVG
  // agrupar centenas de quadrados em poucos <path>.
  const paint = (shape: Shape) => `${shape.fill}|${shape.opacity}`;
  shapes.push(...cells.sort((a, b) => paint(a).localeCompare(paint(b))));
  shapes.push({
    kind: "rect",
    x: W - 210,
    y: H - 120,
    w: 26,
    h: 44,
    fill: "#3ddc97",
    opacity: 0.9,
    className: "art-blink",
  });
  return {
    motif: "bits",
    width: W,
    height: H,
    background: ["#06130e", "#030806"],
    glow: { color: "#0f5132", cx: 0.4, cy: 0.5 },
    shapes,
    caption:
      "Arte generativa: modos de permissão Unix como matrizes de bits rwx; em vermelho, o perigoso 777.",
  };
}

// ------------------------------------------------------------- Cloudflare: rede de borda
export function network(random: Random): Artwork {
  const shapes: Shape[] = [];
  const cx = W * 0.5;
  const cy = H * 1.9;
  const radius = H * 1.55;
  for (let r = radius - 160; r <= radius + 40; r += 40) {
    shapes.push({
      kind: "circle",
      cx,
      cy,
      r: fmt(r),
      stroke: "#335c99",
      strokeWidth: 1,
      opacity: 0.25,
      fill: "none",
    });
  }
  const edges: Array<[number, number]> = [];
  for (let i = 0; i < 26; i++) {
    const angle = -Math.PI / 2 + between(random, -0.62, 0.62);
    const r = radius + between(random, -10, 30);
    edges.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
  }
  const origins: Array<[number, number]> = [
    [W * 0.18, H * 0.86],
    [W * 0.5, H * 0.93],
    [W * 0.82, H * 0.86],
  ];
  for (const [ox, oy] of origins) {
    for (const [ex, ey] of edges) {
      if (random() > 0.45) continue;
      const mx = (ox + ex) / 2 + between(random, -80, 80);
      const my = Math.min(oy, ey) - between(random, 30, 140);
      shapes.push({
        kind: "path",
        d: `M${fmt(ox)} ${fmt(oy)}Q${fmt(mx)} ${fmt(my)} ${fmt(ex)} ${fmt(ey)}`,
        stroke: "#f6821f",
        strokeWidth: 1.4,
        opacity: between(random, 0.25, 0.7),
        dash: "6 8",
        className: "art-flow",
        fill: "none",
      });
    }
    shapes.push({
      kind: "rect",
      x: ox - 18,
      y: oy - 12,
      w: 36,
      h: 24,
      rx: 4,
      fill: "#13233f",
      stroke: "#8fb3ff",
      strokeWidth: 1.5,
    });
    shapes.push({ kind: "circle", cx: ox, cy: oy, r: 3, fill: "#8fb3ff" });
  }
  for (const [ex, ey] of edges) {
    shapes.push({
      kind: "circle",
      cx: fmt(ex),
      cy: fmt(ey),
      r: 9,
      fill: "#f6821f",
      opacity: 0.18,
      className: "art-pulse",
    });
    shapes.push({ kind: "circle", cx: fmt(ex), cy: fmt(ey), r: 3.4, fill: "#ffd2a8" });
  }
  // Varreduras bloqueadas: tentativas de entrada que não encontram porta aberta
  for (let i = 0; i < 14; i++) {
    const x = between(random, 60, W - 60);
    shapes.push({
      kind: "path",
      d: `M${fmt(x)} 0L${fmt(x + between(random, -40, 40))} ${fmt(between(random, 60, 160))}`,
      stroke: "#ff5d73",
      strokeWidth: 1,
      opacity: 0.25,
      dash: "2 6",
      fill: "none",
    });
  }
  return {
    motif: "network",
    width: W,
    height: H,
    background: ["#0c1222", "#060912"],
    glow: { color: "#7a3a0b", cx: 0.5, cy: 0.35 },
    shapes,
    caption:
      "Arte generativa: conexões de saída partindo das origens até os pontos de presença da borda; nenhuma porta de entrada aberta.",
  };
}

// ------------------------------------------------------------- Observabilidade: ridgeline
export function ridgeline(random: Random): Artwork {
  const shapes: Shape[] = [];
  const lines = 26;
  const top = 90;
  const step = (H - top - 40) / lines;
  const left = 170;
  const right = W - 170;
  for (let i = 0; i < lines; i++) {
    const baseY = top + i * step;
    const points: Array<[number, number]> = [];
    const spikes = Array.from({ length: 4 }, () => ({
      at: between(random, 0.35, 0.65),
      width: between(random, 0.015, 0.05),
      height: between(random, 20, 75),
    }));
    for (let x = left; x <= right; x += 5) {
      const t = (x - left) / (right - left);
      const envelope = Math.exp(-(((t - 0.5) / 0.16) ** 2));
      let y = Math.abs(gaussian(random)) * 2.5 * (0.3 + envelope);
      for (const spike of spikes)
        y += spike.height * envelope * Math.exp(-(((t - spike.at) / spike.width) ** 2));
      points.push([x, baseY - y]);
    }
    const d = polyline(points);
    shapes.push({
      kind: "path",
      d: `${d}L${right} ${fmt(baseY + 4)}L${left} ${fmt(baseY + 4)}Z`,
      fill: "#070b16",
      opacity: 1,
    });
    shapes.push({
      kind: "path",
      d,
      stroke: i === Math.floor(lines * 0.6) ? "#5eead4" : "#e8eefc",
      strokeWidth: 1.6,
      opacity: 0.88,
      fill: "none",
    });
  }
  return {
    motif: "ridgeline",
    width: W,
    height: H,
    background: ["#070b16", "#070b16"],
    shapes,
    caption:
      "Arte generativa: séries temporais de uso de CPU empilhadas — picos de carga ao longo do tempo.",
  };
}

// ------------------------------------------------------------- SNMP: radar
export function radar(random: Random): Artwork {
  const shapes: Shape[] = [];
  const cx = W * 0.5;
  const cy = H * 0.55;
  const maxR = H * 0.62;
  for (let r = maxR / 5; r <= maxR; r += maxR / 5) {
    shapes.push({
      kind: "circle",
      cx,
      cy,
      r: fmt(r),
      stroke: "#2fbf71",
      strokeWidth: 1,
      opacity: 0.3,
      fill: "none",
    });
  }
  for (let a = 0; a < 12; a++) {
    const angle = (a / 12) * Math.PI * 2;
    shapes.push({
      kind: "path",
      d: `M${cx} ${cy}L${fmt(cx + maxR * Math.cos(angle))} ${fmt(cy + maxR * Math.sin(angle))}`,
      stroke: "#2fbf71",
      strokeWidth: 0.8,
      opacity: 0.18,
    });
  }
  const sweep: Shape[] = [];
  for (let k = 0; k < 18; k++) {
    const a0 = (-k * 2.2 * Math.PI) / 180;
    const a1 = (-(k + 1) * 2.2 * Math.PI) / 180;
    sweep.push({
      kind: "path",
      d: `M${cx} ${cy}L${fmt(cx + maxR * Math.cos(a0))} ${fmt(cy + maxR * Math.sin(a0))}A${fmt(maxR)} ${fmt(maxR)} 0 0 0 ${fmt(cx + maxR * Math.cos(a1))} ${fmt(cy + maxR * Math.sin(a1))}Z`,
      fill: "#3ddc84",
      opacity: fmt(0.32 * (1 - k / 18)),
    });
  }
  shapes.push({
    kind: "group",
    children: sweep,
    className: "art-sweep",
    transformOrigin: `${cx}px ${cy}px`,
  });
  for (let i = 0; i < 28; i++) {
    const angle = random() * Math.PI * 2;
    const r = Math.sqrt(random()) * maxR * 0.95;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    const alert = random() < 0.12;
    shapes.push({
      kind: "circle",
      cx: fmt(x),
      cy: fmt(y),
      r: alert ? 5 : 3.5,
      fill: alert ? "#ffb020" : "#b9f6ca",
      opacity: 0.95,
    });
    if (alert)
      shapes.push({
        kind: "circle",
        cx: fmt(x),
        cy: fmt(y),
        r: 14,
        stroke: "#ffb020",
        strokeWidth: 1.4,
        opacity: 0.6,
        fill: "none",
        className: "art-pulse",
      });
  }
  shapes.push({ kind: "circle", cx, cy, r: 6, fill: "#d1ffe1" });
  return {
    motif: "radar",
    width: W,
    height: H,
    background: ["#04140c", "#020a06"],
    glow: { color: "#0b4d2b", cx: 0.5, cy: 0.55 },
    shapes,
    caption: "Arte generativa: varredura de polling SNMP; em âmbar, dispositivos com alertas.",
  };
}

// ------------------------------------------------------------- Desempenho: flame graph
export function flamegraph(random: Random): Artwork {
  const shapes: Shape[] = [];
  const rowH = 32;
  const palette = (depth: number) =>
    `hsl(${fmt(between(random, 8, 48))}, ${fmt(between(random, 78, 95))}%, ${fmt(between(random, 48, 60) - depth * 0.6)}%)`;
  const draw = (x: number, width: number, depth: number) => {
    if (width < 8 || depth > 18) return;
    const y = H - 30 - (depth + 1) * rowH;
    if (y < 16) return;
    shapes.push({
      kind: "rect",
      x: fmt(x + 1),
      y: fmt(y),
      w: fmt(width - 2),
      h: rowH - 3,
      rx: 2,
      fill: palette(depth),
      opacity: 0.92,
    });
    // Divide o tempo da função entre 1 a 3 chamadas filhas (o resto é tempo próprio).
    const children = 1 + Math.floor(random() * 3);
    const weights = Array.from({ length: children }, () => between(random, 0.3, 1));
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    const used = width * between(random, 0.72, 0.97);
    let cursor = x + between(random, 0, width - used);
    for (const weight of weights) {
      const child = (used * weight) / total;
      draw(cursor, child, depth + 1);
      cursor += child;
    }
  };
  draw(60, W - 120, 0);
  return {
    motif: "flamegraph",
    width: W,
    height: H,
    background: ["#140a06", "#0a0503"],
    glow: { color: "#5a1d07", cx: 0.5, cy: 0.9 },
    shapes,
    caption:
      "Arte generativa: flame graph — a largura de cada bloco é o tempo de CPU gasto em cada função.",
  };
}

// ------------------------------------------------------------- Engenharia: circuito
export function circuit(random: Random): Artwork {
  const shapes: Shape[] = [];
  const grid = 30;
  const chips = [
    { x: 300, y: 200, w: 180, h: 140 },
    { x: 720, y: 330, w: 220, h: 150 },
    { x: 560, y: 70, w: 120, h: 90 },
  ];
  for (let i = 0; i < 46; i++) {
    let x = Math.round(between(random, 0, W) / grid) * grid;
    let y = Math.round(between(random, 0, H) / grid) * grid;
    const points: Array<[number, number]> = [[x, y]];
    for (let s = 0; s < 6; s++) {
      const dir = pick(random, [
        [1, 0],
        [1, 0],
        [0, 1],
        [0, -1],
        [1, 1],
        [1, -1],
      ] as const);
      const length = grid * Math.ceil(between(random, 1, 5));
      x += dir[0] * length;
      y += dir[1] * length;
      points.push([x, y]);
    }
    const lit = random() < 0.25;
    shapes.push({
      kind: "path",
      d: polyline(points),
      stroke: lit ? "#67e8f9" : "#2b6f8f",
      strokeWidth: lit ? 2.2 : 1.6,
      opacity: lit ? 0.9 : 0.55,
      fill: "none",
      dash: lit ? "14 10" : undefined,
      className: lit ? "art-flow" : undefined,
    });
    shapes.push({
      kind: "circle",
      cx: points[0]![0],
      cy: points[0]![1],
      r: 5,
      fill: "#0b1726",
      stroke: "#e2b04a",
      strokeWidth: 2,
    });
    const end = points.at(-1)!;
    shapes.push({ kind: "circle", cx: end[0], cy: end[1], r: 4, fill: "#e2b04a", opacity: 0.9 });
  }
  for (const chip of chips) {
    shapes.push({
      kind: "rect",
      x: chip.x,
      y: chip.y,
      w: chip.w,
      h: chip.h,
      rx: 10,
      fill: "#0f1d33",
      stroke: "#67e8f9",
      strokeWidth: 1.6,
    });
    for (let p = chip.x + 16; p < chip.x + chip.w - 8; p += 18) {
      shapes.push({
        kind: "rect",
        x: p,
        y: chip.y - 10,
        w: 8,
        h: 10,
        fill: "#e2b04a",
        opacity: 0.85,
      });
      shapes.push({
        kind: "rect",
        x: p,
        y: chip.y + chip.h,
        w: 8,
        h: 10,
        fill: "#e2b04a",
        opacity: 0.85,
      });
    }
  }
  return {
    motif: "circuit",
    width: W,
    height: H,
    background: ["#071423", "#040b14"],
    glow: { color: "#0d3b5c", cx: 0.55, cy: 0.5 },
    shapes,
    caption: "Arte generativa: trilhas de circuito impresso conectando os componentes do sistema.",
  };
}

// ------------------------------------------------------------- Telecom: diagrama de olho
export function eye(random: Random): Artwork {
  const shapes: Shape[] = [];
  const unit = W / 2.6;
  const amplitude = H * 0.28;
  const mid = H * 0.52;
  const level = (bit: number) => mid + (bit ? -amplitude : amplitude);
  for (let trace = 0; trace < 150; trace++) {
    const bitsSeq = Array.from({ length: 5 }, () => (random() < 0.5 ? 1 : 0));
    const jitter = gaussian(random) * 12;
    const noise = gaussian(random) * 11;
    // Cada transição de bit é uma curva de Bézier cúbica em "S" (aproxima o cosseno
    // elevado): 4 comandos por traço em vez de 100 pontos.
    const x0 = -unit * 0.6 + jitter;
    let d = `M${fmt(x0)} ${fmt(level(bitsSeq[0]!) + noise)}`;
    for (let k = 0; k < 4; k++) {
      const from = level(bitsSeq[k]!) + noise;
      const to = level(bitsSeq[k + 1]!) + noise;
      const start = x0 + k * unit;
      const end = start + unit;
      d += `C${fmt(start + unit * 0.36)} ${fmt(from)} ${fmt(end - unit * 0.36)} ${fmt(to)} ${fmt(end)} ${fmt(to)}`;
    }
    shapes.push({
      kind: "path",
      d,
      stroke: spectralColor(0.12 + 0.3 * random(), 66),
      strokeWidth: 1.1,
      opacity: 0.17,
      fill: "none",
    });
  }
  shapes.push({
    kind: "path",
    d: `M0 ${fmt(mid)}L${W} ${fmt(mid)}`,
    stroke: "#9fb4ff",
    strokeWidth: 1,
    opacity: 0.25,
    dash: "4 8",
  });
  return {
    motif: "eye",
    width: W,
    height: H,
    background: ["#0a0f24", "#05070f"],
    glow: { color: "#2a2f8a", cx: 0.5, cy: 0.5 },
    shapes,
    caption:
      "Arte generativa: diagrama de olho — sobreposição de transições de bits com ruído e jitter.",
  };
}

export const GENERATORS = {
  spectrum,
  lattice,
  bits,
  network,
  ridgeline,
  radar,
  flamegraph,
  circuit,
  eye,
} as const;

/** Semente estável a partir de um texto (FNV-1a de 32 bits). */
export function seedFrom(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * Máximo de elementos animados por arte. Cada elemento animado força o navegador a
 * repintar o SVG inteiro a cada quadro; sem GPU (celulares modestos, CI) isso satura a CPU.
 */
export const MAX_ANIMATED_SHAPES = 12;

/** Mantém a animação apenas nos primeiros `limit` elementos (ordem do documento). */
function capAnimations(shapes: Shape[], limit: number): Shape[] {
  let remaining = limit;
  const visit = (shape: Shape): Shape => {
    let next = shape;
    if (shape.className) {
      if (remaining > 0) remaining -= 1;
      else next = { ...shape, className: undefined };
    }
    return next.kind === "group" ? { ...next, children: next.children.map(visit) } : next;
  };
  return shapes.map(visit);
}

export function generateArt(motif: keyof typeof GENERATORS, seed: string | number): Artwork {
  const random = mulberry32(typeof seed === "number" ? seed : seedFrom(seed));
  const art = GENERATORS[motif](random);
  return { ...art, shapes: capAnimations(art.shapes, MAX_ANIMATED_SHAPES) };
}

/** Legenda descritiva da arte (texto alternativo e crédito da capa). */
export function artCaption(motif: keyof typeof GENERATORS, seed: string): string {
  return generateArt(motif, seed).caption;
}
