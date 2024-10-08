// src/experiments/Experiment1.tsx
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import * as dat from "dat.gui";

import { initWorld } from "./experiments/world";
import ExperimentWrapper from "./ExperimentWrapper";

const Bubblewave: React.FC = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const guiRef = useRef<dat.GUI | null>(null);

  const params = useRef({
    amplitude: 10,
    frequency: 1,
    xWaveFactor: 0.2,
    zWaveFactor: 0.2,
    numDrones: 64,
  }).current;

  useEffect(() => {
    const { scene, camera, renderer, controls } = initWorld();
    // Your experiment setup and animation code here
    if (containerRef.current) {
      containerRef.current.appendChild(renderer.domElement);
    }
    // Handle window resize
    const handleResize = () => {
      const width = containerRef.current?.clientWidth || window.innerWidth;
      const height = containerRef.current?.clientHeight || window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);
    };

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Call the handler once to set the initial size
    handleResize();

    // Parameters
    if (guiRef.current === null) {
      guiRef.current = new dat.GUI();

      guiRef.current.add(params, "amplitude", 0, 20);
      guiRef.current.add(params, "frequency", 0, 5);
      guiRef.current.add(params, "xWaveFactor", 0, 1);
      guiRef.current.add(params, "zWaveFactor", 0, 1);
      guiRef.current
        .add(params, "numDrones", 1, 200)
        .step(1)
        .onChange(createDrones);
    }

    // Drone class
    class Bubble {
      position: THREE.Vector3;
      initialY: number;
      mesh: THREE.Mesh;
      constructor(position: THREE.Vector3) {
        this.position = position.clone();
        this.initialY = this.position.y;

        // Visual representation
        const geometry = new THREE.SphereGeometry(2, 16, 16);
        const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        scene.add(this.mesh);
      }

      update(elapsedTime: number) {
        // Oscillate in Y
        const waveAmplitude = params.amplitude;
        const waveFrequency = params.frequency;
        this.position.y =
          this.initialY +
          (Math.sin(
            elapsedTime * waveFrequency + this.position.x * params.xWaveFactor
          ) +
            Math.cos(
              elapsedTime * waveFrequency * 0.5 +
                this.position.z * params.zWaveFactor
            )) *
            (waveAmplitude / 2);

        // Update the mesh position
        this.mesh.position.copy(this.position);

        // Optionally, set the drone to face upwards
        this.mesh.lookAt(this.position.clone().add(new THREE.Vector3(0, 1, 0)));

        const hue =
          (this.position.y + params.amplitude) / (2 * params.amplitude);
        (this.mesh.material as THREE.MeshStandardMaterial).color.setHSL(
          hue,
          1,
          0.5
        );
      }
    }

    // Create drones
    const bubbles: Bubble[] = [];

    function createDrones() {
      // Remove existing drones
      bubbles.forEach((drone) => scene.remove(drone.mesh));
      bubbles.length = 0;

      // Grid dimensions
      const gridSize = Math.ceil(Math.sqrt(params.numDrones));
      const spacing = 10;

      for (let x = 0; x < gridSize; x++) {
        for (let z = 0; z < gridSize; z++) {
          if (bubbles.length >= params.numDrones) break;
          const position = new THREE.Vector3(
            (x - (gridSize - 1) / 2) * spacing,
            50, // Start at ground level
            (z - (gridSize - 1) / 2) * spacing
          );
          const drone = new Bubble(position);
          bubbles.push(drone);
        }
      }
    }

    createDrones();

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);

      const elapsedTime = performance.now() * 0.001; // Convert to seconds

      bubbles.forEach((drone) => {
        drone.update(elapsedTime);
      });

      controls.update();
      renderer.render(scene, camera);
    }

    animate();

    // Append renderer to a container instead of document body
    const container = document.getElementById("three-container");
    if (container) {
      container.appendChild(renderer.domElement);
    }

    // Cleanup on unmount
    return () => {
      // Remove renderer and perform any cleanup
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      if (guiRef.current) {
        guiRef.current.destroy();
        guiRef.current = null;
      }
      // Remove event listener
      window.removeEventListener("resize", handleResize);

      // Dispose of renderer, scene, and controls if necessary
      renderer.dispose();
    };
  }, []);

  return (
    <ExperimentWrapper title="Bubble Wave">
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

export default Bubblewave;
