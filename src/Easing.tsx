import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import * as dat from "dat.gui";
import { initWorld } from "./experiments/world";
import ExperimentWrapper from "./ExperimentWrapper";

const EasingDemo: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const guiRef = useRef<dat.GUI | null>(null);

  const settings = useRef({
    duration: 2000,
  }).current;

  useEffect(() => {
    const { scene, camera, renderer, controls } = initWorld();

    if (containerRef.current) {
      containerRef.current.appendChild(renderer.domElement);
    }

    // GUI setup
    if (guiRef.current === null) {
      guiRef.current = new dat.GUI();
      guiRef.current
        .add(settings, "duration", 2000, 5000)
        .name("Animation Duration");
    }

    // Create spheres with different easing functions
    const createSphere = (color: number, xPosition: number) => {
      const geometry = new THREE.SphereGeometry(5, 32, 32);
      const material = new THREE.MeshStandardMaterial({ color });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(xPosition, 5, 0);
      scene.add(sphere);
      return sphere;
    };

    const easingFunctions = [
      { name: "Linear", func: (t: number) => t, color: 0xff0000 },
      { name: "Quadratic In", func: (t: number) => t * t, color: 0x00ff00 },
      {
        name: "Quadratic Out",
        func: (t: number) => t * (2 - t),
        color: 0x0000ff,
      },
      {
        name: "Quadratic In Out",
        func: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
        color: 0xffa500,
      },
      {
        name: "Exponential In",
        func: (t: number) => (t === 0 ? 0 : Math.pow(1024, t - 1)),
        color: 0xffff00,
      },
      {
        name: "Exponential Out",
        func: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
        color: 0xff00ff,
      },
      {
        name: "Circular In",
        func: (t: number) => 1 - Math.sqrt(1 - t * t),
        color: 0xff8800,
      },
      {
        name: "Circular Out",
        func: (t: number) => Math.sqrt(1 - --t * t),
        color: 0x88ff00,
      },
      {
        name: "Elastic In",
        func: (t: number) =>
          t === 0
            ? 0
            : t === 1
            ? 1
            : -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI),
        color: 0x00ffff,
      },
      {
        name: "Elastic Out",
        func: (t: number) =>
          t === 0
            ? 0
            : t === 1
            ? 1
            : Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1,
        color: 0xffffff,
      },
      {
        name: "Bounce In",
        func: (t: number) => 1 - bounceOut(1 - t),
        color: 0xff007f,
      },
      {
        name: "Bounce Out",
        func: (t: number) => bounceOut(t),
        color: 0x7f00ff,
      },
    ];

    // Bounce easing function
    const bounceOut = (t: number) => {
      if (t < 1 / 2.75) {
        return 7.5625 * t * t;
      } else if (t < 2 / 2.75) {
        return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
      } else if (t < 2.5 / 2.75) {
        return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
      } else {
        return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
      }
    };

    const spheres = easingFunctions.map((easing, index) => {
      return {
        sphere: createSphere(easing.color, -60 + index * 15),
        easing: easing.func,
      };
    });

    // Animate spheres with different easing functions
    const animateSphere = (
      sphere: THREE.Mesh,
      easingFunc: (t: number) => number
    ) => {
      let startTime = performance.now();

      const animate = () => {
        requestAnimationFrame(animate);
        const elapsed = performance.now() - startTime;
        const t = (elapsed % settings.duration) / settings.duration;
        const easedT = easingFunc(t <= 0.5 ? t * 2 : 2 - t * 2) / 2;
        sphere.position.y = 5 + 45 * easedT;
        renderer.render(scene, camera);
      };

      animate();
    };

    spheres.forEach(({ sphere, easing }) => {
      animateSphere(sphere, easing);
    });

    // Handle window resize
    const handleResize = () => {
      const width = containerRef.current?.clientWidth || window.innerWidth;
      const height = containerRef.current?.clientHeight || window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    // Cleanup on unmount
    return () => {
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      if (guiRef.current) {
        guiRef.current.destroy();
        guiRef.current = null;
      }
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, [settings]);

  return (
    <ExperimentWrapper title="Easing Demo">
      <div
        ref={containerRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      />
    </ExperimentWrapper>
  );
};

export default EasingDemo;
