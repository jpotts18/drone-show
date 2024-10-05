import * as THREE from "three";
import { initWorld } from "./world.js";
import * as dat from "dat.gui";

const gui = new dat.GUI();
const params = {
  numFireflies: 50,
  flashRadius: 20,
};

gui.add(params, "flashRadius", 5, 50).onChange(() => {
  fireflies.forEach((firefly) => {
    firefly.flashRadius = params.flashRadius;
  });
});

// Initialize the world
const { scene, camera, renderer, controls } = initWorld();

// Firefly class
class Firefly {
  constructor(position) {
    this.position = position.clone();
    this.phase = Math.random() * Math.PI * 2;
    this.flashInterval = 2 + Math.random(); // Random interval between 2 and 3 seconds
    this.flashThreshold = Math.PI * 2;
    this.flashRadius = 20;

    // Visual representation
    const geometry = new THREE.SphereGeometry(0.5, 16, 16);
    this.material = new THREE.MeshBasicMaterial({ color: 0x000000 });
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.position.copy(this.position);
    scene.add(this.mesh); // Use the scene from initWorld()
  }

  update(deltaTime, fireflies) {
    // Increment phase
    this.phase += (deltaTime * (Math.PI * 2)) / this.flashInterval;

    // Check for flashing
    if (this.phase >= this.flashThreshold) {
      this.phase -= this.flashThreshold;
      this.flash();
      // Notify neighbors
      this.notifyNeighbors(fireflies);
    } else {
      // Gradually dim the light
      const intensity = Math.sin(this.phase);
      this.material.color.setRGB(intensity, intensity, 0);
    }
  }

  flash() {
    // Make the firefly bright yellow when flashing
    this.material.color.setRGB(1, 1, 0);
  }

  notifyNeighbors(fireflies) {
    fireflies.forEach((other) => {
      if (other !== this) {
        const distance = this.position.distanceTo(other.position);
        if (distance <= this.flashRadius) {
          other.adjustPhase();
        }
      }
    });
  }

  adjustPhase() {
    // Adjust phase slightly to sync with neighbors
    this.phase += 0.5;
    // Keep phase within bounds
    if (this.phase >= this.flashThreshold) {
      this.phase -= this.flashThreshold;
    }
  }
}

// Parameters
const NUM_FIREFLIES = 50;
const fireflies = [];

// Create fireflies
function createFireflies() {
  const areaSize = 100;
  for (let i = 0; i < NUM_FIREFLIES; i++) {
    const position = new THREE.Vector3(
      (Math.random() - 0.5) * areaSize,
      (Math.random() - 0.5) * areaSize + 20, // Raise above ground
      (Math.random() - 0.5) * areaSize
    );
    const firefly = new Firefly(position);
    fireflies.push(firefly);
  }
}

createFireflies();

// Animation loop
let lastTime = performance.now();

function animate() {
  requestAnimationFrame(animate);

  const currentTime = performance.now();
  const deltaTime = (currentTime - lastTime) / 1000; // In seconds
  lastTime = currentTime;

  fireflies.forEach((firefly) => {
    firefly.update(deltaTime, fireflies);
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
