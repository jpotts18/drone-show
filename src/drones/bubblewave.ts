import * as THREE from "three";

interface BubbleWaveParams {
  amplitude: number;
  frequency: number;
  xWaveFactor: number;
  zWaveFactor: number;
}

class BubbleWaveDrone {
  position: THREE.Vector3;
  scene: THREE.Scene;
  initialY: number;
  mesh: THREE.Mesh;
  constructor(position: THREE.Vector3, scene: THREE.Scene) {
    this.position = position.clone();
    this.scene = scene;
    this.initialY = this.position.y;

    // Visual representation
    const geometry = new THREE.SphereGeometry(2, 16, 16);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(this.position);
    scene.add(this.mesh);
  }

  update(elapsedTime: number, params: BubbleWaveParams): void {
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

    const hue = (this.position.y + params.amplitude) / (2 * params.amplitude);
    (this.mesh.material as THREE.MeshStandardMaterial).color.setHSL(
      hue,
      1,
      0.5
    );
  }

  static createDrones(
    scene: THREE.Scene,
    numDrones: number
  ): BubbleWaveDrone[] {
    const drones: BubbleWaveDrone[] = [];

    // Grid dimensions
    const gridSize = Math.ceil(Math.sqrt(numDrones));
    const spacing = 10;

    for (let x = 0; x < gridSize; x++) {
      for (let z = 0; z < gridSize; z++) {
        if (drones.length >= numDrones) break;
        const position = new THREE.Vector3(
          (x - (gridSize - 1) / 2) * spacing,
          50, // Start at ground level
          (z - (gridSize - 1) / 2) * spacing
        );
        const drone = new BubbleWaveDrone(position, scene);
        drones.push(drone);
      }
    }

    return drones;
  }
}

export { BubbleWaveDrone };
export type { BubbleWaveParams };
