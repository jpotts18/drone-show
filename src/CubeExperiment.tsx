import { ExperimentBase, createExperiment } from "./ExperimentBase.tsx";
import * as THREE from "three";

import CubeDrone, { CubeDroneParams } from "./drones/cube.ts";

interface CubeSceneParams extends CubeDroneParams {
  numDrones: number;
}

class CubeExperiment extends ExperimentBase<CubeSceneParams> {
  private droneGroup: THREE.Group = new THREE.Group();
  private drones: CubeDrone[] = [];
  private cubeCenter: THREE.Vector3 = new THREE.Vector3(0, 25, 0);

  getInitialParams(): CubeSceneParams {
    return {
      //   rotationSpeed: 0, // Rotation speed in radians per frame
      cubeSize: 25,
      numDrones: 64,
    };
  }

  setup(): void {
    if (!this.scene) return;

    // Remove existing drones
    this.scene.remove(this.droneGroup);
    this.droneGroup = new THREE.Group();

    // Create new drones using the static method
    this.drones = CubeDrone.createDrones(
      this.params.numDrones,
      this.params.cubeSize,
      new THREE.Vector3(0, 50, 0)
    );
    this.drones.forEach((drone) => this.droneGroup.add(drone.mesh));
    this.scene.add(this.droneGroup);

    // Set the position of the entire group to rotate around cubeCenter
    this.droneGroup.position.copy(this.cubeCenter);
  }

  cleanup(): void {
    // Implement cleanup logic here
    if (this.scene) {
      this.scene.remove(this.droneGroup);
    }
    this.drones = [];
  }

  animate(elapsedTime: number): void {
    const scale = 1 + 0.2 * Math.sin(elapsedTime * Math.PI * 0.5); // Scale factor to make the cube shrink and grow
    this.drones.forEach((drone) => drone.update(scale, this.cubeCenter));
    // this.droneGroup.rotation.y += this.params.rotationSpeed;
  }
}

export default createExperiment(CubeExperiment);
