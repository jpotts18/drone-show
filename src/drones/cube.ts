import * as THREE from "three";

interface CubeDroneParams {
  rotationSpeed: number; // Rotation speed in radians per frame
  cubeSize: number;
}

class CubeDrone {
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
    const geometry = new THREE.SphereGeometry(1, 16, 16);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    return new THREE.Mesh(geometry, material);
  }

  update(scale: number, center: THREE.Vector3) {
    const scaledOffset = this.centerOffset.clone().multiplyScalar(scale);
    this.mesh.position.copy(center).add(scaledOffset);
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
    cubeSize: number,
    center: THREE.Vector3 = new THREE.Vector3(0, 50, 0)
  ): CubeDrone[] {
    const drones: CubeDrone[] = [];
    const numPerAxis = Math.cbrt(numDrones);
    const step = cubeSize / (numPerAxis - 1);
    for (let i = 0; i < numPerAxis; i++) {
      for (let j = 0; j < numPerAxis; j++) {
        for (let k = 0; k < numPerAxis; k++) {
          const x = -cubeSize / 2 + i * step;
          const y = -cubeSize / 2 + j * step;
          const z = -cubeSize / 2 + k * step;
          const position = new THREE.Vector3(x, y, z).add(center);
          const drone = new CubeDrone(position, center);
          drones.push(drone);
        }
      }
    }
    return drones;
  }
}

export default CubeDrone;
export type { CubeDroneParams };
