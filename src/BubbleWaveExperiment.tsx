import { ExperimentBase, createExperiment } from "./ExperimentBase.tsx";

import { BubbleWaveDrone, BubbleWaveParams } from "./drones/bubblewave.ts";

interface BubbleWaveSceneParams extends BubbleWaveParams {
  numDrones: number;
}
class BubbleWaveExperiment extends ExperimentBase<BubbleWaveSceneParams> {
  private drones: BubbleWaveDrone[] = [];

  getInitialParams(): BubbleWaveSceneParams {
    return {
      amplitude: 10,
      frequency: 1,
      xWaveFactor: 0.2,
      zWaveFactor: 0.2,
      numDrones: 64,
    };
  }

  setup(): void {
    if (!this.scene) return;

    // Remove existing drones
    this.drones.forEach((drone) => this.scene!.remove(drone.mesh));

    // Create new drones using the static method
    this.drones = BubbleWaveDrone.createDrones(
      this.scene,
      this.params.numDrones
    );
  }
  animate(elapsedTime: number): void {
    this.drones.forEach((drone) => drone.update(elapsedTime, this.params));
  }
}

export default createExperiment(BubbleWaveExperiment);
