import { Canvas } from '@react-three/fiber';
import { ACESFilmicToneMapping, PCFShadowMap } from 'three';
import { Experience } from './components/Experience.tsx';
import { KeyboardInput } from './components/KeyboardInput.tsx';
import { ModelProvider } from './components/ModelProvider.tsx';
import { Overlay } from './components/Overlay.tsx';

export default function App() {
  return (
    <ModelProvider>
      <div className="game-shell">
        <Canvas
          shadows={{ type: PCFShadowMap }}
          dpr={[1, 1.5]}
          camera={{ fov: 48, position: [14, 9, 18], near: 0.1, far: 160 }}
          gl={{
            antialias: true,
            toneMapping: ACESFilmicToneMapping,
            powerPreference: 'high-performance',
          }}
          onCreated={({ gl }) => {
            gl.toneMappingExposure = 1.08;
          }}
        >
          <Experience />
        </Canvas>
        <div className="vignette" />
        <KeyboardInput />
        <Overlay />
      </div>
    </ModelProvider>
  );
}
