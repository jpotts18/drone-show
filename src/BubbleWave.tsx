// src/experiments/Experiment1.tsx
import React, { useEffect } from "react";
import * as THREE from "three";

import { initWorld } from "./experiments/world";

const Bubblewave: React.FC = () => {
  useEffect(() => {
    const { gui, scene, camera, renderer, controls } = initWorld();
    // Your experiment setup and animation code here

    // Parameters
    const params = {
      amplitude: 10,
      frequency: 1,
      xWaveFactor: 0.2,
      zWaveFactor: 0.2,
      numDrones: 64,
    };

    gui.add(params, "amplitude", 0, 20);
    gui.add(params, "frequency", 0, 5);
    gui.add(params, "xWaveFactor", 0, 1);
    gui.add(params, "zWaveFactor", 0, 1);
    gui.add(params, "numDrones", 1, 200).step(1).onChange(createDrones);

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
      if (container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div id="three-container" />;
};

export default Bubblewave;
