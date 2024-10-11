// src/experiments/Experiment1.tsx
import React, { useEffect, useRef } from "react";
import * as THREE from "three";

import { initWorld } from "./experiments/world";
import ExperimentWrapper from "./ExperimentWrapper";

const Boids: React.FC = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { scene, camera, renderer, controls } = initWorld();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Call the handler once to set the initial size
    handleResize();
import { initWorld } from "./experiments/world";
import ExperimentWrapper from "./ExperimentWrapper";

const Boids: React.FC = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { scene, camera, renderer, controls } = initWorld();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Call the handler once to set the initial size
    handleResize();
import { initWorld } from "./experiments/world";
import ExperimentWrapper from "./ExperimentWrapper";

const Boids: React.FC = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { scene, camera, renderer, controls } = initWorld();

    const params = {
      separationWeight: 5,
      alignmentWeight: 1.0,
      cohesionWeight: 1.0,
      maxSpeed: 2,
      maxForce: 0.05,
      numBoids: 32,
      resetBoids: function () {
        boids.forEach((boid) => scene.remove(boid.mesh));
        boids.length = 0;
        for (let i = 0; i < params.numBoids; i++) {
          const boid = new Boid();
          boid.maxSpeed = params.maxSpeed;
          boid.maxForce = params.maxForce;
          boids.push(boid);
        }
      },
    };

    // Boid class

    // Initialize boids
    const boids: Boid[] = [];
    params.resetBoids();

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);

      boids.forEach((boid) => {
        const separation = boid
          .separation(boids)
          .multiplyScalar(params.separationWeight);
        const alignment = boid
          .alignment(boids)
          .multiplyScalar(params.alignmentWeight);
        const cohesion = boid
          .cohesion(boids)
          .multiplyScalar(params.cohesionWeight);
        const boundaries = boid.boundaries();

        boid.applyForce(separation);
        boid.applyForce(alignment);
        boid.applyForce(cohesion);
        boid.applyForce(boundaries);

        boid.update();
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
      // Remove event listener
      window.removeEventListener("resize", handleResize);

      // Dispose of renderer, scene, and controls if necessary
      renderer.dispose();
    };
  }, []);

  return (
    <ExperimentWrapper title="Boids">
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

export default Boids;
