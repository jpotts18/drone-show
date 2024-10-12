import * as THREE from "three";

interface DiskDroneParams {
  rotationSpeed: number; // Rotation speed in radians per frame
  diskRadius: number;
}

class DiskDrone {
  static readonly RIPPLE_FREQUENCY = Math.PI * 0.25;
  static readonly RIPPLE_DAMPING = 0.5;
  static readonly DAMPING_FACTOR_MULTIPLIER = 0.5;
  static readonly CENTER_AMPLITUDE_MULTIPLIER = 1;
  static readonly MINIMUM_AMPLITUDE = 1;

  initialPosition: THREE.Vector3;
  centerOffset: THREE.Vector3;
  mesh: THREE.Mesh;

  constructor(position: THREE.Vector3, center: THREE.Vector3) {
    this.initialPosition = position.clone();
    this.centerOffset = position.clone().sub(center);
    this.mesh = this.createMesh();
    this.mesh.position.copy(this.initialPosition);
  }

  createMesh() {
    const geometry = new THREE.SphereGeometry(0.5, 16, 16);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    return new THREE.Mesh(geometry, material);
  }

  update(scale: number, center: THREE.Vector3, elapsedTime: number) {
    const distanceFromCenter = this.centerOffset.length();
    const rippleEffect = Math.sin(
      elapsedTime * DiskDrone.RIPPLE_FREQUENCY -
        distanceFromCenter * DiskDrone.RIPPLE_DAMPING
    );
    const dampingFactor =
      1 / (1 + distanceFromCenter * DiskDrone.DAMPING_FACTOR_MULTIPLIER); // Dampen the wave based on the radius
    const scaledOffset = this.centerOffset.clone().multiplyScalar(scale);
    this.mesh.position.copy(center).add(scaledOffset);
    this.mesh.position.y =
      rippleEffect *
      dampingFactor *
      Math.max(
        DiskDrone.CENTER_AMPLITUDE_MULTIPLIER * distanceFromCenter,
        DiskDrone.MINIMUM_AMPLITUDE
      ); // Ripple effect in the Y direction with increased center amplitude

    // adjust color intensity
    const intensity = (scale - 0.8) / 0.4; // Normalize between 0 and 1
    (this.mesh.material as THREE.MeshStandardMaterial).color.setHSL(
      0.3,
      1,
      intensity * 0.5 + 0.25
    );
  }

  static createDrones(
    numDrones: number,
    diskRadius: number,
    center: THREE.Vector3 = new THREE.Vector3(0, 0, 0)
  ): DiskDrone[] {
    const drones: DiskDrone[] = [];
    const layers = Math.ceil(Math.sqrt(numDrones));
    let droneCount = 0;

    // Add a drone at the very center
    drones.push(new DiskDrone(center.clone(), center));
    droneCount++;

    for (let layer = 0; layer < layers; layer++) {
      const radius = (diskRadius / layers) * (layer + 1);
      const dronesInLayer = Math.ceil((2 * Math.PI * radius) / 2);
      const angleStep = (2 * Math.PI) / dronesInLayer;

      for (let i = 0; i < dronesInLayer && droneCount < numDrones; i++) {
        const angle = i * angleStep;
        const x = radius * Math.cos(angle);
        const z = radius * Math.sin(angle);
        const position = new THREE.Vector3(x, 0, z).add(center);
        const drone = new DiskDrone(position, center);
        drones.push(drone);
        droneCount++;
      }
    }
    return drones;
  }
}

export default DiskDrone;
export type { DiskDroneParams };
