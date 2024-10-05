// Import statements for ES6 modules
import * as THREE from "three";
import * as dat from "dat.gui";
import { initWorld } from "./world";

const { scene, camera, renderer, controls } = initWorld();
// Parameters
const gui = new dat.GUI();

const params = {
  separationWeight: 1.5,
  alignmentWeight: 1.0,
  cohesionWeight: 1.0,
  maxSpeed: 2,
  maxForce: 0.05,
  numBoids: 32,
  resetBoids: function () {
    boids.forEach((boid) => scene.remove(boid.mesh));
    boids.length = 0;
    for (let i = 0; i < params.numBoids; i++) {
      const boid = new Boid();
      boid.maxSpeed = params.maxSpeed;
      boid.maxForce = params.maxForce;
      boids.push(boid);
    }
  },
};

gui.add(params, "separationWeight", 0, 5);
gui.add(params, "alignmentWeight", 0, 5);
gui.add(params, "cohesionWeight", 0, 5);
gui.add(params, "maxSpeed", 0, 10).onChange((value) => {
  boids.forEach((boid) => (boid.maxSpeed = value));
});
gui.add(params, "maxForce", 0, 1).onChange((value) => {
  boids.forEach((boid) => (boid.maxForce = value));
});
gui.add(params, "numBoids", 1, 100).step(1);
gui.add(params, "resetBoids");

// Boid class
class Boid {
  velocity: THREE.Vector3;
  acceleration: THREE.Vector3;
  position: THREE.Vector3;
  maxSpeed: number;
  maxForce: number;
  mesh: THREE.Mesh;
  constructor() {
    this.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2
    );
    this.acceleration = new THREE.Vector3();
    this.position = new THREE.Vector3(
      Math.random() * 100 - 50,
      Math.random() * 50, // y between 0 and 50
      Math.random() * 100 - 50
    );
    this.maxSpeed = params.maxSpeed;
    this.maxForce = params.maxForce;

    // Visual representation
    const geometry = new THREE.SphereGeometry(0.5, 2, 8);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.mesh = new THREE.Mesh(geometry, material);
    scene.add(this.mesh);
  }

  update() {
    this.velocity.add(this.acceleration);
    this.velocity.clampLength(0, this.maxSpeed);
    this.position.add(this.velocity);
    this.mesh.position.copy(this.position);
    this.acceleration.set(0, 0, 0);
    this.mesh.lookAt(this.position.clone().add(this.velocity));
  }

  applyForce(force: THREE.Vector3) {
    this.acceleration.add(force);
  }

  separation(boids: Boid[]): THREE.Vector3 {
    const desiredSeparation = 5;
    const steer = new THREE.Vector3();
    let count = 0;

    boids.forEach((other: Boid) => {
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

  alignment(boids: Boid[]): THREE.Vector3 {
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

  cohesion(boids: Boid[]): THREE.Vector3 {
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

  boundaries() {
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

// Initialize boids
const boids: Boid[] = [];
params.resetBoids();

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  boids.forEach((boid) => {
    const separation = boid
      .separation(boids)
      .multiplyScalar(params.separationWeight);
    const alignment = boid
      .alignment(boids)
      .multiplyScalar(params.alignmentWeight);
    const cohesion = boid.cohesion(boids).multiplyScalar(params.cohesionWeight);
    const boundaries = boid.boundaries();

    boid.applyForce(separation);
    boid.applyForce(alignment);
    boid.applyForce(cohesion);
    boid.applyForce(boundaries);

    boid.update();
  });

  controls.update();
  renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener("resize", onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}
