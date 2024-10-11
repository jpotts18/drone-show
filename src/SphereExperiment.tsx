import { ExperimentBase, createExperiment } from "./ExperimentBase.tsx";
import * as THREE from "three";

import SphereDrone, { SphereDroneParams } from "./drones/sphere.ts";

interface SphereSceneParams extends SphereDroneParams {
  numDrones: number;
}
class SphereExperiment extends ExperimentBase<SphereSceneParams> {
  private droneGroup: THREE.Group = new THREE.Group();
  private drones: SphereDrone[] = [];
  private sphereCenter: THREE.Vector3 = new THREE.Vector3(0, 50, 0);

  getInitialParams(): SphereSceneParams {
    return {
      beatFrequency: 1, // Beats per second
      rotationSpeed: 0.01, // Rotation speed in radians per frame
      sphereRadius: 25,
      numDrones: 64,
    };
  }

  setup(): void {
    if (!this.scene) return;

    // Remove existing drones
    this.scene.remove(this.droneGroup);
    this.droneGroup = new THREE.Group();

    // Create new drones using the static method
    this.drones = SphereDrone.createDrones(
      this.params.numDrones,
      this.params.sphereRadius,
      new THREE.Vector3(0, 50, 0)
    );
    this.drones.forEach((drone) => this.droneGroup.add(drone.mesh));
    this.scene.add(this.droneGroup);
  }

  cleanup(): void {
    // Implement cleanup logic here
    if (this.scene) {
      this.scene.remove(this.droneGroup);
    }
    this.drones = [];
  }

  animate(elapsedTime: number): void {
    const scale =
      1 + 0.2 * Math.sin(elapsedTime * Math.PI * this.params.beatFrequency);
    this.drones.forEach((drone) => drone.update(scale, this.sphereCenter));
    this.droneGroup.rotation.y += this.params.rotationSpeed;
  }
}

export default createExperiment(SphereExperiment);
