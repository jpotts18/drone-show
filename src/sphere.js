import * as THREE from "three";
import { initWorld } from "./world.js";

// Initialize the world
const { scene, camera, renderer, controls } = initWorld();

// create group to hold the drones
const droneGroup = new THREE.Group();
scene.add(droneGroup);

// Parameters
const NUM_DRONES = 200;
const drones = [];

const params = {
  beatFrequency: 1, // Beats per second
  rotationSpeed: 0.01, // Rotation speed in radians per frame
  sphereRadius: 25,
};

import * as dat from "dat.gui";
const gui = new dat.GUI();
gui.add(params, "beatFrequency", 0.1, 5).name("Beat Frequency");
gui.add(params, "rotationSpeed", -0.1, 0.1).step(0.001).name("Rotation Speed");
gui.add(params, "sphereRadius", 10, 50).name("Sphere Radius");

// Drone class
class Drone {
  constructor(position) {
    this.initialPosition = position.clone();
    this.mesh = this.createMesh();
    this.mesh.position.copy(this.initialPosition);
    droneGroup.add(this.mesh);
  }

  createMesh() {
    const geometry = new THREE.SphereGeometry(0.5, 8, 8);
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    return new THREE.Mesh(geometry, material);
  }

  update(scale) {
    const scaledPosition = this.initialPosition.clone().multiplyScalar(scale);

    this.mesh.position.copy(scaledPosition);
    // adjust color intensity
    const intensity = (scale - 0.8) / 0.4; // Normalize between 0 and 1
    this.mesh.material.color.setHSL(0, 1, intensity * 0.5 + 0.25);
  }
}

// Create drones
function createDrones() {
  // Remove existing drones if any
  drones.forEach((drone) => droneGroup.remove(drone.mesh));
  drones.length = 0;

  for (let i = 0; i < NUM_DRONES; i++) {
    // Generate points on a sphere using spherical coordinates
    const theta = Math.acos(1 - 2 * Math.random()); // Polar angle
    const phi = 2 * Math.PI * Math.random(); // Azimuthal angle

    const x = params.sphereRadius * Math.sin(theta) * Math.cos(phi);
    const y = params.sphereRadius * Math.sin(theta) * Math.sin(phi); // Offset y to prevent drones from being inside the sphere
    const z = params.sphereRadius * Math.cos(theta);

    const position = new THREE.Vector3(x, y, z);

    const drone = new Drone(position);
    drones.push(drone);
  }
}

createDrones();

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = performance.now() * 0.001; // In seconds

  // Calculate scaling factor using a sine wave to simulate heartbeat
  const scale =
    1 + 0.2 * Math.sin(elapsedTime * Math.PI * params.beatFrequency);

  drones.forEach((drone) => {
    drone.update(scale);
  });
  droneGroup.rotation.y += params.rotationSpeed;

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
