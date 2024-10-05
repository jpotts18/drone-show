// src/experiments/Experiment1.tsx
import React, { useEffect } from "react";
import { initWorld } from "./experiments/world";

const Experiment1: React.FC = () => {
  useEffect(() => {
    const { scene, camera, renderer, controls } = initWorld();
    // Your experiment setup and animation code here

    // Append renderer to a container instead of document body
    const container = document.getElementById("three-container");
    if (container) {
      container.appendChild(renderer.domElement);
    }

    // Cleanup on unmount
    return () => {
      // Remove renderer and perform any cleanup
      if (container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div id="three-container" />;
};

export default Experiment1;
