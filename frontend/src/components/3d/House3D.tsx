import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Sphere, Cone } from '@react-three/drei';
import * as THREE from 'three';

export function House3D() {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (groupRef.current) {
            // Gentle floating animation
            groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
            // Slow rotation
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
        }
    });

    return (
        <group ref={groupRef} position={[0, 0, 0]}>
            {/* House base */}
            <Box args={[2, 2, 2]} position={[0, 0, 0]}>
                <meshStandardMaterial color="#3B82F6" />
            </Box>

            {/* Roof */}
            <Cone args={[1.6, 1.2, 4]} position={[0, 1.6, 0]} rotation={[0, Math.PI / 4, 0]}>
                <meshStandardMaterial color="#EF4444" />
            </Cone>

            {/* Door */}
            <Box args={[0.6, 1, 0.1]} position={[0, -0.5, 1.05]}>
                <meshStandardMaterial color="#8B4513" />
            </Box>

            {/* Windows */}
            <Box args={[0.5, 0.5, 0.1]} position={[-0.6, 0.3, 1.05]}>
                <meshStandardMaterial color="#FCD34D" emissive="#FCD34D" emissiveIntensity={0.5} />
            </Box>
            <Box args={[0.5, 0.5, 0.1]} position={[0.6, 0.3, 1.05]}>
                <meshStandardMaterial color="#FCD34D" emissive="#FCD34D" emissiveIntensity={0.5} />
            </Box>

            {/* Floating orbs around house */}
            <Sphere args={[0.15, 16, 16]} position={[-2, 1, 0]}>
                <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={0.5} />
            </Sphere>
            <Sphere args={[0.12, 16, 16]} position={[2, -0.5, 0.5]}>
                <meshStandardMaterial color="#8B5CF6" emissive="#8B5CF6" emissiveIntensity={0.5} />
            </Sphere>
            <Sphere args={[0.18, 16, 16]} position={[1.5, 1.5, -0.5]}>
                <meshStandardMaterial color="#F59E0B" emissive="#F59E0B" emissiveIntensity={0.5} />
            </Sphere>
        </group>
    );
}
