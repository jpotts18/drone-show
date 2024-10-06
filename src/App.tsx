// src/App.tsx
import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Gallery from "./Gallery";
import Bubblewave from "./BubbleWave";
import Boids from "./Boids";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Gallery />} />
        <Route path="/bubblewave" element={<Bubblewave />} />
        <Route path="/boids" element={<Boids />} />
        {/* Add routes for other experiments */}
      </Routes>
    </Router>
  );
};

export default App;
