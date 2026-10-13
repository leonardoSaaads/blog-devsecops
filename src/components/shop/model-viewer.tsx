"use client";

import { Grid3x3, LoaderCircle, Maximize, Rotate3d, RotateCcw, Ruler } from "lucide-react";
import type { BufferGeometry, Material } from "three";
import { useEffect, useRef, useState } from "react";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/format";

export const FILAMENT_COLORS = [
  { name: "Ciano", value: "#22d3ee" },
  { name: "Âmbar", value: "#f59e0b" },
  { name: "Lilás", value: "#a78bfa" },
  { name: "Grafite", value: "#475569" },
  { name: "Branco", value: "#f1f5f9" },
  { name: "Vermelho", value: "#ef4444" },
] as const;

interface Dimensions {
  x: number;
  y: number;
  z: number;
}

interface ViewerHandle {
  setColor: (hex: string) => void;
  setWireframe: (value: boolean) => void;
  setGrid: (value: boolean) => void;
  setAutoRotate: (value: boolean) => void;
  setRunning: (value: boolean) => void;
  resetView: () => void;
  dispose: () => void;
}

/**
 * Visualizador 3D (three.js) para STL/GLB. A biblioteca é importada sob demanda,
 * mantendo o bundle inicial da página leve.
 */
export function ModelViewer({
  src,
  format,
  defaultColor,
  name,
}: {
  src: string;
  format: "stl" | "glb";
  defaultColor: string;
  name: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<ViewerHandle | null>(null);
  const inView = useInView(containerRef);

  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [dimensions, setDimensions] = useState<Dimensions>();
  const [color, setColor] = useState(defaultColor);
  const [wireframe, setWireframe] = useState(false);
  const [grid, setGrid] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const host = canvasHostRef.current;
    if (!host) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    (async () => {
      try {
        const THREE = await import("three");
        const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");
        if (cancelled) return;

        const renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true,
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        host.appendChild(renderer.domElement);
        renderer.domElement.setAttribute("aria-hidden", "true");
        renderer.domElement.className = "block h-full w-full touch-none";

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 5000);
        scene.add(new THREE.HemisphereLight(0xffffff, 0x334155, 2.2));
        const key = new THREE.DirectionalLight(0xffffff, 2.4);
        key.position.set(120, 200, 140);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x88ccff, 1.1);
        rim.position.set(-150, 80, -120);
        scene.add(rim);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.autoRotate = !reducedMotion;
        controls.autoRotateSpeed = 1.2;

        // Carrega a geometria
        let geometry: BufferGeometry;
        if (format === "stl") {
          const { STLLoader } = await import("three/examples/jsm/loaders/STLLoader.js");
          geometry = await new STLLoader().loadAsync(src);
          geometry.rotateX(-Math.PI / 2); // STL de impressão: Z para cima → Y do three.js
        } else {
          const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
          const gltf = await new GLTFLoader().loadAsync(src);
          const meshes: BufferGeometry[] = [];
          gltf.scene.updateMatrixWorld(true);
          gltf.scene.traverse((object) => {
            if (object instanceof THREE.Mesh)
              meshes.push(
                (object.geometry as BufferGeometry).clone().applyMatrix4(object.matrixWorld),
              );
          });
          const { mergeGeometries } =
            await import("three/examples/jsm/utils/BufferGeometryUtils.js");
          geometry = mergeGeometries(meshes) ?? new THREE.BufferGeometry();
        }
        if (cancelled) {
          geometry.dispose();
          renderer.dispose();
          return;
        }

        geometry.computeVertexNormals();
        geometry.computeBoundingBox();
        const box = geometry.boundingBox!;
        const size = new THREE.Vector3();
        box.getSize(size);
        geometry.translate(-(box.min.x + size.x / 2), -box.min.y, -(box.min.z + size.z / 2));

        const material = new THREE.MeshStandardMaterial({
          color: defaultColor,
          roughness: 0.55,
          metalness: 0.05,
          side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        const bedSize = Math.ceil((Math.max(size.x, size.z) * 1.6) / 10) * 10;
        const gridHelper = new THREE.GridHelper(bedSize, bedSize / 10, 0x22d3ee, 0x64748b);
        (gridHelper.material as Material).opacity = 0.35;
        (gridHelper.material as Material).transparent = true;
        scene.add(gridHelper);

        const radius = size.length() / 2;
        const target = new THREE.Vector3(0, size.y / 2, 0);
        const resetView = () => {
          const distance = radius / Math.sin((camera.fov * Math.PI) / 360);
          camera.position.set(distance * 0.75, distance * 0.55, distance * 0.95);
          controls.target.copy(target);
          controls.update();
        };
        resetView();

        const resize = () => {
          const { clientWidth, clientHeight } = host;
          if (clientWidth === 0 || clientHeight === 0) return;
          renderer.setSize(clientWidth, clientHeight, false);
          camera.aspect = clientWidth / clientHeight;
          camera.updateProjectionMatrix();
        };
        const observer = new ResizeObserver(resize);
        observer.observe(host);
        resize();

        let frame = 0;
        let running = true;
        const loop = () => {
          frame = requestAnimationFrame(loop);
          if (!running) return;
          controls.update();
          renderer.render(scene, camera);
        };
        loop();

        handleRef.current = {
          setColor: (hex) => {
            material.color.set(hex);
          },
          setWireframe: (value) => {
            material.wireframe = value;
          },
          setGrid: (value) => {
            gridHelper.visible = value;
          },
          setAutoRotate: (value) => {
            controls.autoRotate = value;
          },
          setRunning: (value) => {
            running = value;
          },
          resetView,
          dispose: () => {
            cancelAnimationFrame(frame);
            observer.disconnect();
            controls.dispose();
            geometry.dispose();
            material.dispose();
            gridHelper.dispose();
            renderer.dispose();
            renderer.domElement.remove();
          },
        };
        setAutoRotate(!reducedMotion);
        setDimensions({ x: size.x, y: size.z, z: size.y });
        setStatus("ready");
      } catch (error) {
        console.error("Falha ao carregar o modelo 3D", error);
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      handleRef.current?.dispose();
      handleRef.current = null;
    };
  }, [src, format, defaultColor]);

  useEffect(() => {
    handleRef.current?.setRunning(inView);
  }, [inView, status]);

  const changeColor = (value: string) => {
    setColor(value);
    handleRef.current?.setColor(value);
  };
  const toggleWireframe = (value: boolean) => {
    setWireframe(value);
    handleRef.current?.setWireframe(value);
  };
  const toggleGrid = (value: boolean) => {
    setGrid(value);
    handleRef.current?.setGrid(value);
  };
  const toggleRotate = (value: boolean) => {
    setAutoRotate(value);
    handleRef.current?.setAutoRotate(value);
  };

  const fullscreen = () => {
    const element = containerRef.current;
    if (!element) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void element.requestFullscreen?.();
  };

  const toggleClass = (active: boolean) =>
    cn(
      "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition",
      active ? "border-accent bg-accent-soft" : "border-border bg-card hover:border-accent",
    );

  return (
    <div
      ref={containerRef}
      className="overflow-hidden rounded-2xl border border-border bg-card"
      data-testid="model-viewer"
      data-status={status}
    >
      <div className="relative aspect-square w-full bg-grid sm:aspect-[4/3] [:fullscreen_&]:aspect-auto [:fullscreen_&]:h-[calc(100dvh-7rem)]">
        <div
          ref={canvasHostRef}
          className="absolute inset-0"
          role="img"
          aria-label={`Modelo 3D interativo: ${name}. Arraste para girar, role para aproximar.`}
        />
        {status === "loading" && (
          <div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> Carregando modelo
              3D…
            </span>
          </div>
        )}
        {status === "error" && (
          <div
            className="absolute inset-0 grid place-items-center p-6 text-center text-sm text-muted-foreground"
            role="alert"
          >
            Não foi possível exibir o modelo 3D (WebGL indisponível ou arquivo inacessível).
          </div>
        )}
        {dimensions && (
          <p
            className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-lg bg-background/85 px-2 py-1 font-mono text-xs backdrop-blur"
            data-testid="model-dimensions"
          >
            <Ruler className="size-3.5 text-accent" aria-hidden="true" />
            {dimensions.x.toFixed(0)} × {dimensions.y.toFixed(0)} × {dimensions.z.toFixed(0)} mm
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-border p-3">
        <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Cor do filamento">
          {FILAMENT_COLORS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={color === option.value}
              aria-label={option.name}
              title={option.name}
              onClick={() => changeColor(option.value)}
              className={cn(
                "size-7 rounded-full border-2 transition",
                color === option.value ? "scale-110 border-foreground" : "border-border",
              )}
              style={{ backgroundColor: option.value }}
            />
          ))}
        </div>
        <div className="ml-auto flex flex-wrap gap-1.5">
          <button
            type="button"
            className={toggleClass(autoRotate)}
            aria-pressed={autoRotate}
            onClick={() => toggleRotate(!autoRotate)}
          >
            <Rotate3d className="size-3.5" aria-hidden="true" /> Girar
          </button>
          <button
            type="button"
            className={toggleClass(wireframe)}
            aria-pressed={wireframe}
            onClick={() => toggleWireframe(!wireframe)}
            data-testid="toggle-wireframe"
          >
            <Grid3x3 className="size-3.5" aria-hidden="true" /> Malha
          </button>
          <button
            type="button"
            className={toggleClass(grid)}
            aria-pressed={grid}
            onClick={() => toggleGrid(!grid)}
          >
            Mesa
          </button>
          <button
            type="button"
            className={toggleClass(false)}
            onClick={() => handleRef.current?.resetView()}
            aria-label="Recentralizar visualização"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            className={toggleClass(false)}
            onClick={fullscreen}
            aria-label="Tela cheia"
          >
            <Maximize className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
