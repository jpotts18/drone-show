import * as THREE from "three";

interface SphereDroneParams {
  beatFrequency: 1; // Beats per second
  rotationSpeed: 0.01; // Rotation speed in radians per frame
  sphereRadius: 25;
}

class SphereDrone {
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
    const geometry = new THREE.SphereGeometry(0.5, 8, 8);
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    return new THREE.Mesh(geometry, material);
  }

  update(scale: number, center: THREE.Vector3) {
    const scaledOffset = this.centerOffset.clone().multiplyScalar(scale);
    this.mesh.position.copy(center).add(scaledOffset);
    // adjust color intensity
    const intensity = (scale - 0.8) / 0.4; // Normalize between 0 and 1
    (this.mesh.material as THREE.MeshStandardMaterial).color.setHSL(
      0,
      1,
      intensity * 0.5 + 0.25
    );
  }
  static createDrones(
    numDrones: number,
    sphereRadius: number,
    center: THREE.Vector3 = new THREE.Vector3(0, 50, 0)
  ): SphereDrone[] {
    const drones: SphereDrone[] = [];
    for (let i = 0; i < numDrones; i++) {
      // Generate points on a sphere using spherical coordinates
      const theta = Math.acos(1 - 2 * Math.random()); // Polar angle
      const phi = 2 * Math.PI * Math.random(); // Azimuthal angle

      const x = sphereRadius * Math.sin(theta) * Math.cos(phi);
      const y = sphereRadius * Math.sin(theta) * Math.sin(phi); // Offset y to prevent drones from being inside the sphere
      const z = sphereRadius * Math.cos(theta);

      const position = new THREE.Vector3(x, y, z).add(center);

      const drone = new SphereDrone(position, center);
      drones.push(drone);
    }
    return drones;
  }
}

export default SphereDrone;
export type { SphereDroneParams };
