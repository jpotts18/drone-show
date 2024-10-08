// src/experiments/Experiment1.tsx
import React, { useEffect, useRef } from "react";
import * as THREE from "three";

import { initWorld } from "./experiments/world";
import dat from "dat.gui";
import ExperimentWrapper from "./ExperimentWrapper";

const Boids: React.FC = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const guiRef = useRef<dat.GUI | null>(null);

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

    if (guiRef.current === null) {
      guiRef.current = new dat.GUI();

      guiRef.current.add(params, "separationWeight", 5, 10);
      guiRef.current.add(params, "alignmentWeight", 0, 5);
      guiRef.current.add(params, "cohesionWeight", 0, 5);
      guiRef.current.add(params, "maxSpeed", 0, 10).onChange((value) => {
        boids.forEach((boid) => (boid.maxSpeed = value));
      });
      guiRef.current.add(params, "maxForce", 0, 1).onChange((value) => {
        boids.forEach((boid) => (boid.maxForce = value));
      });
      guiRef.current.add(params, "numBoids", 1, 100).step(1);
      guiRef.current.add(params, "resetBoids");
    }

    // Boid class
    class Boid {
      velocity: THREE.Vector3;
      acceleration: THREE.Vector3;
      position: THREE.Vector3;
      maxSpeed: number;
      maxForce: number;
      mesh: THREE.Mesh;
      constructor() {
        this.velocity = new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        );
        this.acceleration = new THREE.Vector3();
        this.position = new THREE.Vector3(
          Math.random() * 100 - 50,
          Math.random() * 50, // y between 0 and 50
          Math.random() * 100 - 50
        );
        this.maxSpeed = params.maxSpeed;
        this.maxForce = params.maxForce;

        // Visual representation
        const geometry = new THREE.SphereGeometry(2, 16, 16);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        this.mesh = new THREE.Mesh(geometry, material);
        scene.add(this.mesh);
      }

      update() {
        this.velocity.add(this.acceleration);
        this.velocity.clampLength(0, this.maxSpeed);
        this.position.add(this.velocity);
        this.mesh.position.copy(this.position);
        this.acceleration.set(0, 0, 0);
        this.mesh.lookAt(this.position.clone().add(this.velocity));
      }

      applyForce(force: THREE.Vector3) {
        this.acceleration.add(force);
      }

      separation(boids: Boid[]): THREE.Vector3 {
        const desiredSeparation = 5;
        const steer = new THREE.Vector3();
        let count = 0;

        boids.forEach((other: Boid) => {
          const d = this.position.distanceTo(other.position);
          if (d > 0 && d < desiredSeparation) {
            const diff = this.position
              .clone()
              .sub(other.position)
              .normalize()
              .divideScalar(d);
            steer.add(diff);
            count++;
          }
        });

        if (count > 0) {
          steer.divideScalar(count);
        }

        if (steer.length() > 0) {
          steer.setLength(this.maxSpeed);
          steer.sub(this.velocity);
          steer.clampLength(0, this.maxForce);
        }

        return steer;
      }

      alignment(boids: Boid[]): THREE.Vector3 {
        const neighborDist = 20;
        const sum = new THREE.Vector3();
        let count = 0;

        boids.forEach((other) => {
          const d = this.position.distanceTo(other.position);
          if (d > 0 && d < neighborDist) {
            sum.add(other.velocity);
            count++;
          }
        });

        if (count > 0) {
          sum.divideScalar(count);
          sum.setLength(this.maxSpeed);
          const steer = sum.sub(this.velocity);
          steer.clampLength(0, this.maxForce);
          return steer;
        } else {
          return new THREE.Vector3();
        }
      }

      cohesion(boids: Boid[]): THREE.Vector3 {
        const neighborDist = 20;
        const sum = new THREE.Vector3();
        let count = 0;

        boids.forEach((other) => {
          const d = this.position.distanceTo(other.position);
          if (d > 0 && d < neighborDist) {
            sum.add(other.position);
            count++;
          }
        });

        if (count > 0) {
          sum.divideScalar(count);
          return this.seek(sum);
        } else {
          return new THREE.Vector3();
        }
      }

      seek(target: THREE.Vector3): THREE.Vector3 {
        const desired = target.clone().sub(this.position);
        desired.setLength(this.maxSpeed);
        const steer = desired.sub(this.velocity);
        steer.clampLength(0, this.maxForce);
        return steer;
      }

      boundaries() {
        const margin = 100;
        const turnFactor = 0.5;
        const steer = new THREE.Vector3();

        if (this.position.x > margin) {
          steer.x = -turnFactor;
        } else if (this.position.x < -margin) {
          steer.x = turnFactor;
        }

        if (this.position.y > 75) {
          steer.y = -turnFactor;
        } else if (this.position.y < 0) {
          steer.y = turnFactor;
        }

        if (this.position.z > margin) {
          steer.z = -turnFactor;
        } else if (this.position.z < -margin) {
          steer.z = turnFactor;
        }

        return steer;
      }
    }

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
