"use client";

import { LoaderCircle, Pause, Rotate3d } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { BufferGeometry, Material, Object3D } from "three";
import { useInView } from "@/hooks/use-in-view";
import {
  FIBERS,
  acceptanceAngle,
  coreIndex,
  criticalAngle,
  cutoffWavelength,
  modeCount,
  rayPath,
  vNumber,
  type FiberType,
} from "@/lib/simulations/fiber";
import { InteractiveFigure, Stat, controlButton, controlToggle } from "./interactive-figure";

interface SceneHandle {
  setFiber: (fiber: FiberType) => void;
  setAutoRotate: (value: boolean) => void;
  setRunning: (value: boolean) => void;
  dispose: () => void;
}

const number = (value: number, digits = 2) =>
  value.toLocaleString("pt-BR", { maximumFractionDigits: digits });

/** Escala da cena: raio do revestimento (250 µm) = 1 unidade. */
const UNIT = 125;
const START = -4;
const END = 3.6;

async function createScene(
  host: HTMLElement,
  initial: FiberType,
  reducedMotion: boolean,
): Promise<SceneHandle> {
  const THREE = await import("three");
  const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.setAttribute("aria-hidden", "true");
  renderer.domElement.className = "block h-full w-full";
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(3.2, 2.4, 6.4);
  scene.add(new THREE.HemisphereLight(0xdbeafe, 0x0b1324, 1.6));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(4, 6, 5);
  scene.add(key);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enableZoom = false; // não sequestra a rolagem da página
  controls.enablePan = false;
  controls.autoRotate = !reducedMotion;
  controls.autoRotateSpeed = 0.8;
  controls.target.set(0, 0, 0);
  // Permite rolar a página com gesto vertical no celular; arraste horizontal gira o modelo.
  renderer.domElement.style.touchAction = "pan-y";

  const disposables: Array<BufferGeometry | Material> = [];
  const track = <T extends BufferGeometry | Material>(item: T): T => {
    disposables.push(item);
    return item;
  };
  let fiberGroup: Object3D | null = null;
  let pulses: Array<{
    mesh: Object3D;
    points: Array<[number, number]>;
    rotation: number;
    offset: number;
  }> = [];

  /** Cilindro ao longo do eixo X entre x0 e x1. */
  const tube = (
    radius: number,
    x0: number,
    x1: number,
    material: Material,
    thetaStart = 0,
    thetaLength = Math.PI * 2,
  ) => {
    const geometry = track(
      new THREE.CylinderGeometry(radius, radius, x1 - x0, 96, 1, false, thetaStart, thetaLength),
    );
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.z = Math.PI / 2;
    mesh.position.x = (x0 + x1) / 2;
    return mesh;
  };

  const build = (fiber: FiberType) => {
    if (fiberGroup) scene.remove(fiberGroup);
    disposables.splice(0).forEach((item) => item.dispose());
    const group = new THREE.Group();
    const coreR = fiber.core / 2 / UNIT;
    const cladR = fiber.cladding / 2 / UNIT;
    const coatR = fiber.coating / 2 / UNIT;

    const coating = track(
      new THREE.MeshStandardMaterial({
        color: 0x2f5fd0,
        roughness: 0.55,
        metalness: 0.05,
        side: THREE.DoubleSide,
      }),
    );
    const glass = track(
      new THREE.MeshStandardMaterial({
        color: 0xbfe6ff,
        roughness: 0.08,
        metalness: 0,
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    const core = track(
      new THREE.MeshStandardMaterial({
        color: 0x67e8f9,
        emissive: 0x0ea5e9,
        emissiveIntensity: 0.6,
        transparent: true,
        opacity: 0.4,
        depthWrite: false,
      }),
    );

    // Revestimento recortado (¾ de volta) para revelar a casca de vidro.
    group.add(tube(coatR, START, -0.6, coating, Math.PI * 0.5, Math.PI * 1.5));
    group.add(tube(cladR, START, END, glass));
    group.add(tube(Math.max(coreR, 0.012), START, END + 0.02, core));

    // Raios de luz: zigue-zague/senoides em planos girados em torno do eixo.
    // Raios e pulsos desenhados por cima do vidro (sem teste de profundidade) para ficarem legíveis.
    const rayMaterial = track(
      new THREE.LineBasicMaterial({
        color: 0xff7a45,
        transparent: true,
        opacity: 0.95,
        depthTest: false,
      }),
    );
    const pulseMaterial = track(new THREE.MeshBasicMaterial({ color: 0xffd166, depthTest: false }));
    const pulseGeometry = track(
      new THREE.SphereGeometry(fiber.id === "single" ? 0.025 : 0.03, 16, 16),
    );
    const angles = fiber.id === "single" ? [0] : [7, 11, 15];
    pulses = [];
    angles.forEach((angle, index) => {
      const radius = fiber.id === "single" ? 0 : coreR * 0.92;
      const points =
        angle === 0
          ? ([
              [0, 0],
              [END - START, 0],
            ] as Array<[number, number]>)
          : rayPath(fiber.profile, {
              radius,
              length: END - START,
              angle: angle * 2.4,
              segments: 400,
            });
      const rotation = (index * Math.PI * 2) / angles.length;
      const vertices = points.map(
        ([x, y]) => new THREE.Vector3(START + x, y * Math.cos(rotation), y * Math.sin(rotation)),
      );
      const line = new THREE.Line(
        track(new THREE.BufferGeometry().setFromPoints(vertices)),
        rayMaterial,
      );
      line.renderOrder = 10;
      group.add(line);
      for (let k = 0; k < 3; k += 1) {
        const mesh = new THREE.Mesh(pulseGeometry, pulseMaterial);
        mesh.renderOrder = 11;
        group.add(mesh);
        pulses.push({ mesh, points, rotation, offset: k / 3 + index * 0.11 });
      }
    });

    scene.add(group);
    fiberGroup = group;
  };

  const placePulses = (time: number) => {
    for (const pulse of pulses) {
      // Fase sempre em [0, 1): o primeiro quadro pode chegar com tempo levemente negativo
      // (timestamp do requestAnimationFrame anterior à criação do Timer).
      const t = (((time * 0.12 + pulse.offset) % 1) + 1) % 1;
      const position = t * (pulse.points.length - 1);
      const i = Math.min(Math.max(Math.floor(position), 0), pulse.points.length - 1);
      const [x0, y0] = pulse.points[i]!;
      const [x1, y1] = pulse.points[Math.min(i + 1, pulse.points.length - 1)]!;
      const f = position - i;
      const x = x0 + (x1 - x0) * f;
      const y = y0 + (y1 - y0) * f;
      pulse.mesh.position.set(
        START + x,
        y * Math.cos(pulse.rotation),
        y * Math.sin(pulse.rotation),
      );
    }
  };

  const resize = () => {
    const { clientWidth: width, clientHeight: height } = host;
    if (width === 0 || height === 0) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();

  build(initial);
  placePulses(0);
  // THREE.Clock foi descontinuado; Timer recebe o timestamp do próprio laço de animação.
  const timer = new THREE.Timer();
  const loop = (timestamp: number) => {
    timer.update(timestamp);
    controls.update();
    if (!reducedMotion) placePulses(timer.getElapsed());
    renderer.render(scene, camera);
  };
  renderer.setAnimationLoop(loop);

  return {
    setFiber: build,
    setAutoRotate: (value) => {
      controls.autoRotate = value && !reducedMotion;
    },
    setRunning: (value) => renderer.setAnimationLoop(value ? loop : null),
    dispose: () => {
      renderer.setAnimationLoop(null);
      timer.dispose();
      observer.disconnect();
      controls.dispose();
      disposables.forEach((item) => item.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}

/** Corte transversal em escala real (SVG): sempre disponível, inclusive sem WebGL. */
function CrossSection({ fiber }: { fiber: FiberType }) {
  const scale = 90 / (fiber.coating / 2);
  return (
    <svg
      viewBox="-100 -100 200 200"
      className="mx-auto w-40"
      role="img"
      aria-label={`Corte transversal: núcleo de ${fiber.core} µm, casca de ${fiber.cladding} µm e revestimento de ${fiber.coating} µm`}
    >
      <circle r={(fiber.coating / 2) * scale} fill="#2f5fd0" />
      <circle r={(fiber.cladding / 2) * scale} fill="#cfe9fb" />
      <circle r={Math.max((fiber.core / 2) * scale, 1.5)} fill="#0ea5e9" />
      <text
        y={-((fiber.coating / 2) * scale) + 12}
        textAnchor="middle"
        className="fill-white text-[9px]"
      >
        {fiber.coating} µm
      </text>
      <text
        y={-((fiber.cladding / 2) * scale) + 12}
        textAnchor="middle"
        className="fill-slate-700 text-[9px]"
      >
        {fiber.cladding} µm
      </text>
    </svg>
  );
}

export function Fiber3D() {
  const [fiberId, setFiberId] = useState<FiberType["id"]>("multi");
  const [autoRotate, setAutoRotate] = useState(true);
  const [status, setStatus] = useState<"pending" | "ready" | "error">("pending");
  const containerRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<SceneHandle | null>(null);
  const fiberRef = useRef<FiberType["id"]>(fiberId);
  const inView = useInView(containerRef);
  const fiber = FIBERS[fiberId];

  // Carrega three.js apenas quando a figura entra na tela.
  useEffect(() => {
    const host = hostRef.current;
    if (!inView || !host || handleRef.current) return;
    let cancelled = false;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    createScene(host, FIBERS[fiberRef.current], reducedMotion)
      .then((handle) => {
        if (cancelled) {
          handle.dispose();
          return;
        }
        handleRef.current = handle;
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [inView]);

  useEffect(() => {
    handleRef.current?.setRunning(inView);
  }, [inView]);

  useEffect(
    () => () => {
      handleRef.current?.dispose();
      handleRef.current = null;
    },
    [],
  );

  const chooseFiber = (id: FiberType["id"]) => {
    setFiberId(id);
    fiberRef.current = id;
    handleRef.current?.setFiber(FIBERS[id]);
  };

  const toggleRotate = () => {
    const next = !autoRotate;
    setAutoRotate(next);
    handleRef.current?.setAutoRotate(next);
  };

  return (
    <InteractiveFigure
      title="Anatomia de uma fibra óptica em 3D"
      description="Arraste para girar. O revestimento foi recortado para revelar a casca de vidro (125 µm) e o núcleo, onde a luz fica confinada por reflexão interna total. Proporções radiais reais; ângulos dos raios exagerados para visualização."
      testId="fiber-3d"
      actions={
        <button
          type="button"
          className={controlButton}
          onClick={toggleRotate}
          aria-pressed={autoRotate}
        >
          {autoRotate ? (
            <Pause className="size-4" aria-hidden="true" />
          ) : (
            <Rotate3d className="size-4" aria-hidden="true" />
          )}
          {autoRotate ? "Parar rotação" : "Girar"}
        </button>
      }
    >
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Tipo de fibra">
          {(Object.values(FIBERS) as FiberType[]).map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={fiberId === item.id}
              onClick={() => chooseFiber(item.id)}
              className={controlToggle(fiberId === item.id)}
              data-testid={`fiber-${item.id}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_13rem]">
          <div
            ref={containerRef}
            className="relative aspect-[16/10] overflow-hidden rounded-xl lg:aspect-auto lg:h-full lg:min-h-80 bg-[radial-gradient(ellipse_at_center,#13203d,#060a14)]"
          >
            <div ref={hostRef} className="absolute inset-0" data-testid="fiber-canvas" />
            {status !== "ready" && (
              <div className="absolute inset-0 grid place-items-center p-6 text-center text-sm text-slate-300">
                {status === "error" ? (
                  <p>
                    WebGL indisponível neste navegador. O corte transversal ao lado mostra as mesmas
                    camadas.
                  </p>
                ) : (
                  <p className="inline-flex items-center gap-2">
                    <LoaderCircle
                      className={inView ? "size-4 animate-spin" : "size-4"}
                      aria-hidden="true"
                    />{" "}
                    carregando modelo 3D…
                  </p>
                )}
              </div>
            )}
            <ul
              className="pointer-events-none absolute bottom-3 left-3 space-y-1 text-[11px] text-slate-200"
              aria-hidden="true"
            >
              <li className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-[#2f5fd0]" /> revestimento (acrilato)
              </li>
              <li className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-[#cfe9fb]" /> casca (sílica)
              </li>
              <li className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-[#0ea5e9]" /> núcleo (sílica dopada)
              </li>
              <li className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-[#ff7a45]" /> luz guiada
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <CrossSection fiber={fiber} />
            <dl className="grid grid-cols-2 gap-2 lg:grid-cols-1" data-testid="fiber-stats">
              <Stat
                label="Núcleo / casca"
                value={`${number(fiber.core, 1)} / ${fiber.cladding} µm`}
              />
              <Stat
                label="Abertura numérica"
                value={number(fiber.numericalAperture)}
                hint={`n₁ ≈ ${number(coreIndex(fiber), 4)} · n₂ ≈ ${number(fiber.claddingIndex, 3)}`}
              />
              <Stat
                label="Ângulo crítico"
                value={`${number(criticalAngle(fiber), 1)}°`}
                hint={`aceitação: ±${number(acceptanceAngle(fiber), 1)}° no ar`}
              />
              <Stat
                label={`V em ${number(fiber.wavelength * 1000, 0)} nm`}
                value={
                  <span data-testid="fiber-modes">
                    {modeCount(fiber) === 1 ? "1 modo" : `≈ ${modeCount(fiber)} modos`}
                  </span>
                }
                hint={`V = ${number(vNumber(fiber))}${fiber.id === "single" ? ` · corte em ${number(cutoffWavelength(fiber) * 1000, 0)} nm` : ""}`}
                tone={fiber.id === "single" ? "success" : undefined}
              />
            </dl>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {fiber.id === "single"
            ? "Com V < 2,405 só o modo fundamental se propaga: não há dispersão intermodal, e o alcance chega a milhares de quilômetros com amplificação."
            : "Centenas de modos percorrem caminhos diferentes. O perfil gradual reduz a diferença de atraso entre eles, mas o alcance fica limitado a algumas centenas de metros a 10 Gb/s ou mais."}
        </p>
      </div>
    </InteractiveFigure>
  );
}
