#!/usr/bin/env node
/**
 * Gera os modelos 3D de exemplo da loja (STL binário, unidades em mm, eixo Z para cima).
 * Uso: npm run models:generate
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import { STLExporter } from "three/examples/jsm/exporters/STLExporter.js";

const OUTPUT_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "models");

/** Caixa com origem no canto inferior (x, y, z) e dimensões (w, d, h). */
function box(group, x, y, z, w, d, h) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, d, h));
  mesh.position.set(x + w / 2, y + d / 2, z + h / 2);
  group.add(mesh);
}

function cylinder(group, x, y, z, radius, h) {
  const geometry = new THREE.CylinderGeometry(radius, radius, h, 24);
  geometry.rotateX(Math.PI / 2); // eixo do cilindro em Z
  const mesh = new THREE.Mesh(geometry);
  mesh.position.set(x, y, z + h / 2);
  group.add(mesh);
}

function raspberryPiCase() {
  const g = new THREE.Group();
  const W = 94,
    D = 66,
    H = 30,
    T = 2;
  box(g, 0, 0, 0, W, D, T); // piso
  // Paredes frontal/traseira sólidas
  box(g, 0, 0, T, W, T, H - T);
  box(g, 0, D - T, T, W, T, H - T);
  // Paredes laterais com aletas de ventilação
  for (const x of [0, W - T]) {
    box(g, x, T, T, T, D - 2 * T, 7);
    box(g, x, T, H - 6, T, D - 2 * T, 6);
    for (let y = T; y < D - T - 1; y += 5) box(g, x, y, T + 7, T, 2.5, H - T - 13);
  }
  // Standoffs nas posições de fixação da placa (58 x 49 mm)
  const ox = (W - 58) / 2,
    oy = (D - 49) / 2;
  for (const [dx, dy] of [
    [0, 0],
    [58, 0],
    [0, 49],
    [58, 49],
  ])
    cylinder(g, ox + dx, oy + dy, T, 3, 5);
  return g;
}

function sfpOrganizer() {
  const g = new THREE.Group();
  const cols = 6,
    rows = 2,
    bayW = 15,
    bayD = 10,
    T = 2,
    H = 32;
  const W = cols * (bayW + T) + T;
  const D = rows * (bayD + T) + T;
  box(g, 0, 0, 0, W, D, T);
  for (let c = 0; c <= cols; c++) box(g, c * (bayW + T), 0, T, T, D, H - T);
  for (let r = 0; r <= rows; r++) box(g, 0, r * (bayD + T), T, W, T, H - T);
  box(g, 0, -6, 0, W, 6, 4); // aba frontal para etiquetas
  return g;
}

function waveVase() {
  const height = 120,
    rows = 60,
    segments = 72;
  const profile = [];
  for (let i = 0; i <= rows; i++) {
    const t = i / rows;
    const radius = 30 + 10 * Math.sin(t * Math.PI) + 4 * Math.sin(t * 3 * Math.PI);
    profile.push(new THREE.Vector2(radius, t * height));
  }
  const lathe = new THREE.LatheGeometry(profile, segments);
  // Ondulação angular que gira ao longo da altura
  const pos = lathe.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i),
      y = pos.getY(i),
      z = pos.getZ(i);
    const angle = Math.atan2(z, x);
    const k = 1 + 0.06 * Math.sin(8 * angle + y * 0.06);
    pos.setXYZ(i, x * k, y, z * k);
  }
  lathe.rotateX(Math.PI / 2); // Y (altura) → Z
  lathe.computeVertexNormals();

  const base = new THREE.CircleGeometry(profile[0].x, segments);
  const g = new THREE.Group();
  g.add(new THREE.Mesh(lathe));
  g.add(new THREE.Mesh(base));
  return g;
}

const models = {
  "case-raspberry-pi": raspberryPiCase,
  "organizador-sfp": sfpOrganizer,
  "vaso-onda": waveVase,
};

mkdirSync(OUTPUT_DIR, { recursive: true });
const exporter = new STLExporter();
for (const [name, build] of Object.entries(models)) {
  const group = build();
  group.updateMatrixWorld(true);
  const data = exporter.parse(group, { binary: true });
  const file = join(OUTPUT_DIR, `${name}.stl`);
  writeFileSync(file, Buffer.from(data.buffer));
  console.log(`✔ ${name}.stl (${(data.byteLength / 1024).toFixed(0)} KiB)`);
}
