import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { initWorld } from "./experiments/world";
import ExperimentWrapper from "./ExperimentWrapper";

const EasingDemo: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const DURATION = 5000;

  useEffect(() => {
    const { scene, camera, renderer, controls } = initWorld();

    if (containerRef.current) {
      containerRef.current.appendChild(renderer.domElement);
    }

    // Create spheres with different easing functions
    const createSphere = (color: number, xPosition: number) => {
      const geometry = new THREE.SphereGeometry(2, 16, 16);
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
        color: 0x00ff00,
      },
      {
        name: "Quadratic In Out",
        func: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
        color: 0x00ff00,
      },
      {
        name: "Exponential In",
        func: (t: number) => (t === 0 ? 0 : Math.pow(1024, t - 1)),
        color: 0x0000ff,
      },
      {
        name: "Exponential Out",
        func: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
        color: 0x0000ff,
      },
      {
        name: "Circular In",
        func: (t: number) => 1 - Math.sqrt(1 - t * t),
        color: 0xffff00,
      },
      {
        name: "Circular Out",
        func: (t: number) => Math.sqrt(1 - --t * t),
        color: 0xffff00,
      },
    ];

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
        const t = (elapsed % DURATION) / DURATION;
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
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, []);

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
