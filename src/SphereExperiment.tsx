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

  setupGui(gui: dat.GUI): void {
    gui
      .add(this.params, "beatFrequency", 0, 20)
      .onChange((value) => this.updateParams({ beatFrequency: value }));
    gui
      .add(this.params, "rotationSpeed", 0, 5)
      .onChange((value) => this.updateParams({ rotationSpeed: value }));
    gui.add(this.params, "sphereRadius", 0, 1).onChange((value) => {
      this.updateParams({ sphereRadius: value });
      this.setup();
    });
    gui
      .add(this.params, "numDrones", 1, 200)
      .step(1)
      .onChange((value) => {
        this.params.numDrones = value;
        this.setup();
      });
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
