"use client";

import { useEffect, useRef } from "react";

/**
 * ECHO-1, live — the centre specimen of SELECTED. The probe from the "One Bit
 * From Home" case, rebuilt here with the same machinery it ships with: a
 * Three.js WebGPU renderer and a TSL Bayer-4×4 dither material that speaks two
 * tones only. Here the two tones are the page's own — lit pixels resolve to
 * --ink, unlit to nothing, so the craft floats on the card's dotted readout
 * field instead of sitting in a black box.
 *
 * It tumbles slowly on its station. Off-screen the loop parks itself; reduced
 * motion holds a single posed frame; and WebGPURenderer falls back to WebGL2 on
 * its own when the GPU backend is unavailable — three/webgpu is loaded lazily so
 * none of it touches the server bundle.
 */
export default function EchoProbe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three/webgpu");
      const {
        Fn, uniform, float, vec2, vec3, vec4,
        fract, floor, step, mix, clamp, dot, normalize, pow,
        screenCoordinate, normalWorld, positionWorld, cameraPosition,
      } = await import("three/tsl");

      if (disposed) return;

      // Page tokens drive the two tones, so the probe never looks bolted on.
      const css = getComputedStyle(document.documentElement);
      const ink = css.getPropertyValue("--ink").trim() || "#f2f0eb";
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const uPaper = uniform(new THREE.Color(ink)); // the one lit tone
      const uCell = uniform(2.0); // dither cell, device px
      const uLightDir = uniform(new THREE.Vector3(1, 0.55, 0.8));

      // Bayer 4×4 threshold from two lines of math — no lookup table.
      // (TSL nodes are dynamically typed here, as in the source case.)
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const bayer2 = Fn(([coord]: [any]) => {
        const a: any = floor(coord);
        return fract(a.x.mul(0.5).add(a.y.mul(a.y).mul(0.75)));
      });
      const bayer4 = Fn(([coord]: [any]) =>
        bayer2(coord.mul(0.5)).mul(0.25).add(bayer2(coord)),
      );

      // luminance in → a lit --ink pixel or nothing (alpha 0). The dark half of
      // the two-tone system is simply the card showing through.
      const ditherColor = Fn(([lum]: [any]) => {
        const threshold = bayer4(screenCoordinate.xy.div(uCell));
        const lit = step(threshold.add(0.001), lum);
        return vec4(uPaper, lit);
      });

      // ECHO-1 herself: bare metal, no surface noise — just light and dither.
      const makeProbeMaterial = () => {
        const mat = new THREE.MeshBasicNodeMaterial({
          side: THREE.DoubleSide,
          transparent: true,
        });
        mat.colorNode = Fn(() => {
          const n = normalize(normalWorld);
          const lambert = clamp(dot(n, normalize(uLightDir)), 0, 1);
          const view = normalize(cameraPosition.sub(positionWorld));
          const rim = pow(clamp(float(1).sub(dot(n, view)), 0, 1), 2).mul(0.3);
          const lum = lambert.mul(0.8).add(rim).add(0.08);
          return ditherColor(clamp(lum, 0, 1));
        })();
        return mat;
      };

      // Built from primitives, like the real ones were: a hex bus, one high-gain
      // dish forever pointed home, a magnetometer boom, an RTG.
      const buildProbe = () => {
        const mat = makeProbeMaterial();
        const probe = new THREE.Group();

        const bus = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.3, 6), mat);

        const dish = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.22, 32, 1, true), mat);
        dish.rotation.x = Math.PI; // open side up — listening
        dish.position.y = 0.34;

        const feed = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8), mat);
        feed.position.y = 0.42;

        const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.5, 8), mat);
        boom.rotation.z = Math.PI / 2;
        boom.position.x = 0.75;

        const rtg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.28, 8), mat);
        rtg.rotation.z = Math.PI / 2;
        rtg.position.x = 1.45;

        const instrument = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.14), mat);
        instrument.position.set(-0.42, -0.1, 0);

        probe.add(bus, dish, feed, boom, rtg, instrument);
        return { probe, mat };
      };

      const renderer = new THREE.WebGPURenderer({ canvas, antialias: true, alpha: true });
      await renderer.init();
      if (disposed) {
        renderer.dispose();
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0); // transparent — the card is the ground

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 60);
      camera.position.z = 4.7;

      const { probe, mat } = buildProbe();
      // The boom throws the mass off to +x; hold it in a rig so the spin reads
      // as a centred tumble rather than an orbit around one corner.
      const rig = new THREE.Group();
      probe.position.x = -0.4;
      probe.rotation.z = 0.28;
      rig.add(probe);
      rig.scale.setScalar(1.15);
      scene.add(rig);

      const size = () => {
        const rect = canvas.getBoundingClientRect();
        const w = Math.max(1, rect.width);
        const h = Math.max(1, rect.height);
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      size();

      let last = performance.now();
      let running = false;

      const frame = () => {
        const now = performance.now();
        const dt = Math.min(now - last, 64); // clamp long gaps (tab wake)
        last = now;
        rig.rotation.y += 0.00035 * dt;
        rig.rotation.x = Math.sin(now * 0.00018) * 0.18;
        renderer.render(scene, camera);
      };

      const play = () => {
        if (running || reduce) return;
        running = true;
        last = performance.now();
        renderer.setAnimationLoop(frame);
      };
      const park = () => {
        running = false;
        renderer.setAnimationLoop(null);
      };

      // A posed still for reduced motion — three-quarter view, dish toward home.
      if (reduce) {
        rig.rotation.set(0.12, -0.7, 0);
        renderer.render(scene, camera);
      }

      const ro = new ResizeObserver(() => {
        size();
        if (reduce || !running) renderer.render(scene, camera);
      });
      ro.observe(canvas);

      const io = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) play();
        else park();
      });
      io.observe(canvas);

      cleanup = () => {
        io.disconnect();
        ro.disconnect();
        renderer.setAnimationLoop(null);
        mat.dispose();
        probe.children.forEach((c) => {
          (c as { geometry?: { dispose?: () => void } }).geometry?.dispose?.();
        });
        renderer.dispose();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="h-full w-full"
    />
  );
}
