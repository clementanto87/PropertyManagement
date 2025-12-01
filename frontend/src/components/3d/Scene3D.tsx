import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { House3D } from './House3D';

export function Scene3D() {
    return (
        <div style={{ width: '100%', height: '600px' }}>
            <Canvas>
                <PerspectiveCamera makeDefault position={[0, 2, 8]} fov={50} />
                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    autoRotate
                    autoRotateSpeed={0.5}
                    minPolarAngle={Math.PI / 3}
                    maxPolarAngle={Math.PI / 2}
                />

                {/* Lighting */}
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
                <pointLight position={[-10, -10, -5]} intensity={0.5} color="#3B82F6" />

                {/* Environment */}
                <Environment preset="sunset" />

                {/* 3D House */}
                <House3D />
            </Canvas>
        </div>
    );
}
