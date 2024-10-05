import * as THREE from "three";
import * as dat from "dat.gui";
import { initWorld } from "./world";

const { scene, camera, renderer, controls } = initWorld();

// Parameters
const params = {
  amplitude: 10,
  frequency: 1,
  xWaveFactor: 0.2,
  zWaveFactor: 0.2,
  numDrones: 64,
};

const gui = new dat.GUI();
gui.add(params, "amplitude", 0, 20);
gui.add(params, "frequency", 0, 5);
gui.add(params, "xWaveFactor", 0, 1);
gui.add(params, "zWaveFactor", 0, 1);
gui.add(params, "numDrones", 1, 200).step(1).onChange(createDrones);

// Drone class
class Drone {
  constructor(position) {
    this.position = position.clone();
    this.initialY = this.position.y;

    // Visual representation
    const geometry = new THREE.SphereGeometry(2, 16, 16);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(this.position);
    scene.add(this.mesh);
  }

  update(elapsedTime) {
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
    this.mesh.material.color.setHSL(hue, 1, 0.5);
  }
}

// Create drones
const drones = [];

function createDrones() {
  // Remove existing drones
  drones.forEach((drone) => scene.remove(drone.mesh));
  drones.length = 0;

  // Grid dimensions
  const gridSize = Math.ceil(Math.sqrt(params.numDrones));
  const spacing = 10;

  for (let x = 0; x < gridSize; x++) {
    for (let z = 0; z < gridSize; z++) {
      if (drones.length >= params.numDrones) break;
      const position = new THREE.Vector3(
        (x - (gridSize - 1) / 2) * spacing,
        50, // Start at ground level
        (z - (gridSize - 1) / 2) * spacing
      );
      const drone = new Drone(position);
      drones.push(drone);
    }
  }
}

createDrones();

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = performance.now() * 0.001; // Convert to seconds

  drones.forEach((drone) => {
    drone.update(elapsedTime);
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
