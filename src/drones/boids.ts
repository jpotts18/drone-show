import * as THREE from "three";

interface BoidDroneParams {
  separationWeight: number;
  alignmentWeight: number;
  cohesionWeight: number;
  maxSpeed: number;
  maxForce: number;
}

class BoidDrone {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  acceleration: THREE.Vector3;
  position: THREE.Vector3;
  maxSpeed: number;
  maxForce: number;

  constructor(params: BoidDroneParams) {
    // Initialize position, velocity, acceleration
    this.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2
    );
    this.acceleration = new THREE.Vector3();
    this.position = new THREE.Vector3(
      Math.random() * 100 - 50,
      Math.random() * 50,
      Math.random() * 100 - 50
    );

    // Set parameters for speed and force limits
    this.maxSpeed = params.maxSpeed;
    this.maxForce = params.maxForce;

    // Create the visual representation (mesh)
    const geometry = new THREE.SphereGeometry(2, 16, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(this.position);
  }

  update() {
    // Update velocity with current acceleration
    this.velocity.add(this.acceleration);

    // Limit velocity to max speed
    this.velocity.clampLength(0, this.maxSpeed);

    // Update position based on velocity
    this.position.add(this.velocity);

    // Update the mesh position to reflect the new position
    this.mesh.position.copy(this.position);

    // Reset acceleration for next frame
    this.acceleration.set(0, 0, 0);

    // Orient the drone in the direction it's moving
    this.mesh.lookAt(this.position.clone().add(this.velocity));
  }

  applyForce(force: THREE.Vector3) {
    // Add force to acceleration (forces get accumulated each frame)
    this.acceleration.add(force);
  }

  static createDrones(numDrones: number, params: BoidDroneParams): BoidDrone[] {
    const drones: BoidDrone[] = [];
    for (let i = 0; i < numDrones; i++) {
      drones.push(new BoidDrone(params));
    }
    return drones;
  }

  // Flocking behaviors

  separation(boids: BoidDrone[]): THREE.Vector3 {
    const desiredSeparation = 5;
    const steer = new THREE.Vector3();
    let count = 0;

    boids.forEach((other: BoidDrone) => {
      const d = this.position.distanceTo(other.position);
      if (d > 0 && d < desiredSeparation) {
        const diff = this.position
          .clone()
          .sub(other.position)
          .normalize()
          .divideScalar(d);
        steer.add(diff);
        count++;
      }
    });

    if (count > 0) {
      steer.divideScalar(count);
    }

    if (steer.length() > 0) {
      steer.setLength(this.maxSpeed);
      steer.sub(this.velocity);
      steer.clampLength(0, this.maxForce);
    }

    return steer;
  }

  alignment(boids: BoidDrone[]): THREE.Vector3 {
    const neighborDist = 20;
    const sum = new THREE.Vector3();
    let count = 0;

    boids.forEach((other) => {
      const d = this.position.distanceTo(other.position);
      if (d > 0 && d < neighborDist) {
        sum.add(other.velocity);
        count++;
      }
    });

    if (count > 0) {
      sum.divideScalar(count);
      sum.setLength(this.maxSpeed);
      const steer = sum.sub(this.velocity);
      steer.clampLength(0, this.maxForce);
      return steer;
    } else {
      return new THREE.Vector3();
    }
  }

  cohesion(boids: BoidDrone[]): THREE.Vector3 {
    const neighborDist = 20;
    const sum = new THREE.Vector3();
    let count = 0;

    boids.forEach((other) => {
      const d = this.position.distanceTo(other.position);
      if (d > 0 && d < neighborDist) {
        sum.add(other.position);
        count++;
      }
    });

    if (count > 0) {
      sum.divideScalar(count);
      return this.seek(sum);
    } else {
      return new THREE.Vector3();
    }
  }

  seek(target: THREE.Vector3): THREE.Vector3 {
    const desired = target.clone().sub(this.position);
    desired.setLength(this.maxSpeed);
    const steer = desired.sub(this.velocity);
    steer.clampLength(0, this.maxForce);
    return steer;
  }

  boundaries(): THREE.Vector3 {
    const margin = 100;
    const turnFactor = 0.5;
    const steer = new THREE.Vector3();

    if (this.position.x > margin) {
      steer.x = -turnFactor;
    } else if (this.position.x < -margin) {
      steer.x = turnFactor;
    }

    if (this.position.y > 75) {
      steer.y = -turnFactor;
    } else if (this.position.y < 0) {
      steer.y = turnFactor;
    }

    if (this.position.z > margin) {
      steer.z = -turnFactor;
    } else if (this.position.z < -margin) {
      steer.z = turnFactor;
    }

    return steer;
  }
}

export default BoidDrone;
export type { BoidDroneParams };
