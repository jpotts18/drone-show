import { ExperimentBase, createExperiment } from "./ExperimentBase.tsx";
import * as THREE from "three";

import BoidDrone, { BoidDroneParams } from "./drones/boids.ts";

class BoidsExperiment extends ExperimentBase<BoidDroneParams> {
  private drones: BoidDrone[] = [];
  private NUM_DRONES: number = 32;

  getInitialParams(): BoidDroneParams {
    return {
      separationWeight: 5,
      alignmentWeight: 1.0,
      cohesionWeight: 1.0,
      maxSpeed: 2,
      maxForce: 0.05,
    };
  }

  setup(): void {
    if (!this.scene) return;

    // Remove existing drones
    this.drones.forEach((drone) => this.scene!.remove(drone.mesh));

    // Create new drones
    this.drones = BoidDrone.createDrones(
      this.NUM_DRONES,
      this.getInitialParams()
    );

    // Add drones to the group, which is added to the scene
    this.drones.forEach((drone) => this.scene!.add(drone.mesh));
  }

  cleanup(): void {
    // Implement cleanup logic here
    if (this.scene) {
      this.drones.forEach((drone) => this.scene!.remove(drone.mesh));
    }
    this.drones = [];
  }

  animate(elapsedTime: number): void {
    this.drones.forEach((boid) => {
      const separation = boid
        .separation(this.drones)
        .multiplyScalar(this.params.separationWeight);
      const alignment = boid
        .alignment(this.drones)
        .multiplyScalar(this.params.alignmentWeight);
      const cohesion = boid
        .cohesion(this.drones)
        .multiplyScalar(this.params.cohesionWeight);
      const boundaries = boid.boundaries();

      boid.applyForce(separation);
      boid.applyForce(alignment);
      boid.applyForce(cohesion);
      boid.applyForce(boundaries);

      boid.update();
    });
  }
}

export default createExperiment(BoidsExperiment);
