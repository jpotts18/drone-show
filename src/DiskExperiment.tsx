import { ExperimentBase, createExperiment } from "./ExperimentBase.tsx";
import * as THREE from "three";

import DiskDrone, { DiskDroneParams } from "./drones/disk.ts";

interface DiskSceneParams extends DiskDroneParams {
  numDrones: number;
}

class DiskExperiment extends ExperimentBase<DiskSceneParams> {
  private droneGroup: THREE.Group = new THREE.Group();
  private drones: DiskDrone[] = [];
  private diskCenter: THREE.Vector3 = new THREE.Vector3(0, 25, 0);

  getInitialParams(): DiskSceneParams {
    return {
      rotationSpeed: 0.0, // Rotation speed in radians per frame
      diskRadius: 50,
      numDrones: 706,
    };
  }

  setup(): void {
    if (!this.scene) return;

    // Remove existing drones
    this.scene.remove(this.droneGroup);
    this.droneGroup = new THREE.Group();

    // Create new drones using the static method
    this.drones = DiskDrone.createDrones(
      this.params.numDrones,
      this.params.diskRadius,
      this.diskCenter
    );
    this.drones.forEach((drone) => this.droneGroup.add(drone.mesh));
    this.scene.add(this.droneGroup);

    // Set the position of the entire group to rotate around diskCenter
    this.droneGroup.position.copy(this.diskCenter);
  }

  cleanup(): void {
    // Implement cleanup logic here
    if (this.scene) {
      this.scene.remove(this.droneGroup);
    }
    this.drones = [];
  }

  animate(elapsedTime: number): void {
    const scale = 1 + 0.2 * Math.sin(elapsedTime * Math.PI * 0.5); // Scale factor to make the disk ripple
    this.drones.forEach((drone) =>
      drone.update(1, this.diskCenter, elapsedTime)
    );
    this.droneGroup.rotation.y += this.params.rotationSpeed;
  }
}

export default createExperiment(DiskExperiment);
