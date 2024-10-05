import * as THREE from "three";
import * as dat from "dat.gui";
import { initWorld } from "./world";

const { scene, camera, renderer, controls } = initWorld();
// Create a group to hold the drones
const droneGroup = new THREE.Group();
scene.add(droneGroup);

// Parameters
const params = {
  numDrones: 200,
  maxSpeed: 2,
  baseSpeed: 0.5,
  speedFactor: 20,
  inwardForce: 0.1,
  lerpFactor: 0.1,
};

const gui = new dat.GUI();
gui.add(params, "numDrones", 10, 500).step(1).onChange(createDrones);
gui.add(params, "maxSpeed", 0.1, 5);
gui.add(params, "baseSpeed", 0, 2);
gui.add(params, "speedFactor", 0, 50);
gui.add(params, "inwardForce", -1, 1);
gui.add(params, "lerpFactor", 0, 1);

const drones = [];

// Drone class
class Drone {
  constructor(position) {
    this.position = position.clone();
    this.velocity = new THREE.Vector3();
    this.maxSpeed = params.maxSpeed;

    // Visual representation
    const geometry = new THREE.SphereGeometry(0.5, 8, 8);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(this.position);
    droneGroup.add(this.mesh);
  }

  update() {
    // Get the flow field vector at the drone's position
    const flow = flowField(this.position);

    // Accelerate towards the flow direction
    this.velocity.lerp(flow, params.lerpFactor);
    this.velocity.clampLength(0, this.maxSpeed);

    // Update position
    this.position.add(this.velocity);

    // Update the mesh position
    this.mesh.position.copy(this.position);

    // Rotate the drone to face its velocity
    if (this.velocity.lengthSq() > 0.001) {
      this.mesh.lookAt(this.position.clone().add(this.velocity));
    }
  }
}
const centers = [
  new THREE.Vector3(-50, 0, -50),
  new THREE.Vector3(50, 0, 50),
  //   new THREE.Vector3(25, 0, 25),
  // Add more centers as needed
];

function flowField(position) {
  let flow = new THREE.Vector3();

  centers.forEach((center) => {
    const directionToCenter = new THREE.Vector3().subVectors(center, position);
    const distance = directionToCenter.length();
    const perpendicular = new THREE.Vector3(
      -directionToCenter.z,
      0,
      directionToCenter.x
    ).normalize();
    const speed = params.baseSpeed + params.speedFactor / (distance + 1);
    const vortexFlow = new THREE.Vector3()
      .copy(perpendicular)
      .multiplyScalar(speed)
      .addScaledVector(directionToCenter.normalize(), params.inwardForce);

    flow.add(vortexFlow);
  });

  return flow;
}

// Create drones
function createDrones() {
  // Remove existing drones
  drones.forEach((drone) => droneGroup.remove(drone.mesh));
  drones.length = 0;

  const areaSize = 100;

  for (let i = 0; i < params.numDrones; i++) {
    const position = new THREE.Vector3(
      (Math.random() - 0.5) * areaSize,
      0,
      (Math.random() - 0.5) * areaSize
    );
    const drone = new Drone(position);
    drones.push(drone);
  }
}

createDrones();

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  drones.forEach((drone) => {
    drone.update();
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
