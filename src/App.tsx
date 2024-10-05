// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Gallery from "./Gallery";
import Experiment from "./Experiment";

const App: React.FC = () => {
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <Routes>
        <Route path="/" element={<Gallery />} />
        <Route path="/experiment" element={<Experiment />} />
        {/* Add routes for other experiments */}
      </Routes>
    </Router>
  );
};

export default App;
