"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Center } from "@react-three/drei";
import { useGLTF } from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { useLoader } from "@react-three/fiber";
import { Box3, Vector3 } from "three";

function GLTFModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const box = new Box3().setFromObject(scene);
  const center = new Vector3();
  box.getCenter(center);
  scene.position.sub(center);
  return <primitive object={scene} />;
}

function OBJModel({ url }: { url: string }) {
  const obj = useLoader(OBJLoader, url);
  return <primitive object={obj} />;
}

function Model({ url }: { url: string }) {
  const ext = url.split(".").pop()?.toLowerCase();
  if (ext === "obj") return <OBJModel url={url} />;
  return <GLTFModel url={url} />;
}

function LoadingBox() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#7c3aed" wireframe />
    </mesh>
  );
}

export function ProductViewer3D({ modelUrl }: { modelUrl: string }) {
  return (
    <div className="w-full aspect-square bg-[#0f0f18] rounded-xl overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Environment preset="city" />
        <Center>
          <Suspense fallback={<LoadingBox />}>
            <Model url={modelUrl} />
          </Suspense>
        </Center>
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          autoRotate
          autoRotateSpeed={1}
        />
      </Canvas>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-gray-400 bg-black/50 px-3 py-1 rounded-full">
        Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
}
