import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import * as dat from "dat.gui";
import { initWorld } from "./experiments/world";
import ExperimentWrapper from "./ExperimentWrapper";

export interface ExperimentProps {
  title: string;
}

export abstract class ExperimentBase<T extends Record<string, any>> {
  protected params: T;
  protected scene: THREE.Scene | null = null;
  protected camera: THREE.Camera | null = null;
  protected renderer: THREE.Renderer | null = null;

  constructor() {
    this.params = this.getInitialParams();
  }

  abstract getInitialParams(): T;
  abstract setup(): void;
  abstract setupGui(gui: dat.GUI, params: T): void;
  abstract animate(elapsedTime: number): void;

  updateParams(updates: Partial<T>) {
    this.params = { ...this.params, ...updates };
    this.onParamsUpdate();
  }

  protected onParamsUpdate() {
    // Override this method in subclasses if needed
  }

  setSceneElements(
    scene: THREE.Scene,
    camera: THREE.Camera,
    renderer: THREE.Renderer
  ) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
  }
}

export function createExperiment<T extends Record<string, any>>(
  ExperimentClass: new () => ExperimentBase<T>
) {
  return function ExperimentComponent({ title }: ExperimentProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const guiRef = useRef<dat.GUI | null>(null);
    const experimentRef = useRef<ExperimentBase<T> | null>(null);
    const [experiment] = useState(() => new ExperimentClass());

    useEffect(() => {
      const { scene, camera, renderer, controls } = initWorld();
      experimentRef.current = experiment;
      experiment.setSceneElements(scene, camera, renderer);

      if (containerRef.current) {
        containerRef.current.appendChild(renderer.domElement);
      }

      const handleResize = () => {
        const width = containerRef.current?.clientWidth || window.innerWidth;
        const height = containerRef.current?.clientHeight || window.innerHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
      };

      window.addEventListener("resize", handleResize);
      handleResize();

      const params = experiment.getInitialParams();

      if (guiRef.current === null) {
        guiRef.current = new dat.GUI();
        experiment.setupGui(guiRef.current, params);
      }

      experiment.setup();

      function animate() {
        requestAnimationFrame(animate);
        const elapsedTime = performance.now() * 0.001;
        experiment.animate(elapsedTime);
        controls.update();
        renderer.render(scene, camera);
      }

      animate();

      return () => {
        if (containerRef.current) {
          containerRef.current.removeChild(renderer.domElement);
        }
        if (guiRef.current) {
          guiRef.current.destroy();
          guiRef.current = null;
        }
        window.removeEventListener("resize", handleResize);
        renderer.dispose();
      };
    }, [experiment]);

    return (
      <ExperimentWrapper title={title}>
        <div
          ref={containerRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        />
      </ExperimentWrapper>
    );
  };
}
