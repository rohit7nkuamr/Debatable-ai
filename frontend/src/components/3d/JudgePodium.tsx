'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface JudgePodiumProps {
    position: [number, number, number];
    isActive: boolean;
}

export default function JudgePodium({ position, isActive }: JudgePodiumProps) {
    const groupRef = useRef<THREE.Group>(null);
    const scalesRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        // Gentle floating animation
        if (groupRef.current) {
            groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.03;
        }

        // Scales balance animation
        if (scalesRef.current) {
            scalesRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.1;
        }
    });

    return (
        <group ref={groupRef} position={position}>
            {/* Main Podium - Elevated throne-like structure */}
            <mesh position={[0, -0.5, 0]}>
                <cylinderGeometry args={[1.5, 2, 1, 8]} />
                <meshStandardMaterial
                    color="#1A1A1A"
                    metalness={0.9}
                    roughness={0.1}
                />
            </mesh>

            {/* Gold trim ring */}
            <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[1.4, 1.6, 8]} />
                <meshBasicMaterial color="#C9A227" />
            </mesh>

            {/* Crimson accent ring */}
            <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[1.6, 1.8, 8]} />
                <meshBasicMaterial color="#8B0000" transparent opacity={0.8} />
            </mesh>

            {/* Judge Avatar - Scale of Justice theme */}
            <group ref={scalesRef} position={[0, 0.8, 0]}>
                {/* Central pillar */}
                <mesh position={[0, 0, 0]}>
                    <cylinderGeometry args={[0.1, 0.1, 1.5, 16]} />
                    <meshStandardMaterial color="#C9A227" metalness={0.8} roughness={0.2} />
                </mesh>

                {/* Balance beam */}
                <mesh position={[0, 0.7, 0]}>
                    <boxGeometry args={[2, 0.1, 0.1]} />
                    <meshStandardMaterial color="#C9A227" metalness={0.8} roughness={0.2} />
                </mesh>

                {/* Left scale pan */}
                <mesh position={[-0.9, 0.3, 0]}>
                    <cylinderGeometry args={[0.3, 0.3, 0.05, 16]} />
                    <meshStandardMaterial color="#8B0000" metalness={0.7} roughness={0.3} />
                </mesh>

                {/* Right scale pan */}
                <mesh position={[0.9, 0.3, 0]}>
                    <cylinderGeometry args={[0.3, 0.3, 0.05, 16]} />
                    <meshStandardMaterial color="#8B0000" metalness={0.7} roughness={0.3} />
                </mesh>

                {/* Scale chains */}
                <mesh position={[-0.9, 0.5, 0]}>
                    <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
                    <meshStandardMaterial color="#C9A227" metalness={0.9} roughness={0.1} />
                </mesh>
                <mesh position={[0.9, 0.5, 0]}>
                    <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
                    <meshStandardMaterial color="#C9A227" metalness={0.9} roughness={0.1} />
                </mesh>
            </group>

            {/* Glowing orb above scales */}
            <mesh position={[0, 1.8, 0]}>
                <sphereGeometry args={[0.25, 32, 32]} />
                <meshStandardMaterial
                    color="#FFFFFF"
                    emissive="#C9A227"
                    emissiveIntensity={isActive ? 0.8 : 0.3}
                    metalness={0.5}
                    roughness={0.2}
                />
            </mesh>

            {/* Light beams emanating from judge */}
            {isActive && (
                <>
                    <mesh position={[0, 1, 0]} rotation={[0, 0, Math.PI / 4]}>
                        <boxGeometry args={[0.02, 3, 0.02]} />
                        <meshBasicMaterial color="#C9A227" transparent opacity={0.3} />
                    </mesh>
                    <mesh position={[0, 1, 0]} rotation={[0, 0, -Math.PI / 4]}>
                        <boxGeometry args={[0.02, 3, 0.02]} />
                        <meshBasicMaterial color="#C9A227" transparent opacity={0.3} />
                    </mesh>
                </>
            )}
        </group>
    );
}
