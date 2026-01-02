'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function StudioEnvironment() {
    const spotLightLeftRef = useRef<THREE.SpotLight>(null);
    const spotLightRightRef = useRef<THREE.SpotLight>(null);

    useFrame((state) => {
        // Subtle light animation
        if (spotLightLeftRef.current) {
            spotLightLeftRef.current.intensity = 50 + Math.sin(state.clock.elapsedTime * 0.5) * 10;
        }
        if (spotLightRightRef.current) {
            spotLightRightRef.current.intensity = 50 + Math.cos(state.clock.elapsedTime * 0.5) * 10;
        }
    });

    return (
        <>
            {/* Ambient Light */}
            <ambientLight intensity={0.2} color="#1a1a2e" />

            {/* Main Key Light */}
            <directionalLight
                position={[0, 10, 5]}
                intensity={1}
                color="#C9A227"
                castShadow
            />

            {/* Stage floor - Circular arena */}
            <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <circleGeometry args={[12, 64]} />
                <meshStandardMaterial
                    color="#0F0F0F"
                    metalness={0.8}
                    roughness={0.3}
                />
            </mesh>

            {/* Arena ring - Gold trim */}
            <mesh position={[0, -1.95, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[11.5, 12, 64]} />
                <meshBasicMaterial color="#C9A227" />
            </mesh>

            {/* Inner ring - Cyan accent */}
            <mesh position={[0, -1.9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[8, 8.2, 64]} />
                <meshBasicMaterial color="#00FFFF" transparent opacity={0.6} />
            </mesh>

            {/* Center VS marker */}
            <mesh position={[0, -1.85, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.8, 1.2, 6]} />
                <meshBasicMaterial color="#C9A227" />
            </mesh>

            {/* Stage back wall - Curved */}
            <mesh position={[0, 3, -10]}>
                <planeGeometry args={[30, 12]} />
                <meshStandardMaterial
                    color="#0A0A0A"
                    metalness={0.9}
                    roughness={0.1}
                />
            </mesh>

            {/* Neon accent lines on back wall */}
            {[-8, -4, 0, 4, 8].map((x, i) => (
                <mesh key={i} position={[x, 3, -9.9]}>
                    <boxGeometry args={[0.05, 10, 0.01]} />
                    <meshBasicMaterial
                        color={i % 2 === 0 ? '#C9A227' : '#00FFFF'}
                        transparent
                        opacity={0.5}
                    />
                </mesh>
            ))}

            {/* Spotlight - Left debater (Gold) */}
            <spotLight
                ref={spotLightLeftRef}
                position={[-5, 8, 5]}
                angle={0.4}
                penumbra={0.5}
                intensity={50}
                color="#C9A227"
                castShadow
                target-position={[-4, 0, 0]}
            />

            {/* Spotlight - Right debater (Cyan) */}
            <spotLight
                ref={spotLightRightRef}
                position={[5, 8, 5]}
                angle={0.4}
                penumbra={0.5}
                intensity={50}
                color="#00FFFF"
                castShadow
                target-position={[4, 0, 0]}
            />

            {/* Judge spotlight (Crimson/Gold) */}
            <spotLight
                position={[0, 10, -3]}
                angle={0.3}
                penumbra={0.5}
                intensity={40}
                color="#8B0000"
                castShadow
            />

            {/* Point lights for atmosphere */}
            <pointLight position={[-10, 5, 0]} intensity={20} color="#C9A227" distance={15} />
            <pointLight position={[10, 5, 0]} intensity={20} color="#00FFFF" distance={15} />

            {/* Stage columns/pillars */}
            {[-10, 10].map((x, i) => (
                <group key={i} position={[x, 0, -5]}>
                    <mesh position={[0, 0, 0]}>
                        <cylinderGeometry args={[0.5, 0.6, 8, 16]} />
                        <meshStandardMaterial
                            color="#1A1A1A"
                            metalness={0.8}
                            roughness={0.2}
                        />
                    </mesh>
                    {/* Pillar light ring */}
                    <mesh position={[0, 3, 0]}>
                        <torusGeometry args={[0.6, 0.05, 16, 32]} />
                        <meshBasicMaterial color={i === 0 ? '#C9A227' : '#00FFFF'} />
                    </mesh>
                </group>
            ))}

            {/* Floating particles/dust effect simulation with small spheres */}
            {Array.from({ length: 30 }).map((_, i) => (
                <mesh
                    key={i}
                    position={[
                        (Math.random() - 0.5) * 20,
                        Math.random() * 8 - 1,
                        (Math.random() - 0.5) * 15
                    ]}
                >
                    <sphereGeometry args={[0.02, 8, 8]} />
                    <meshBasicMaterial
                        color={i % 2 === 0 ? '#C9A227' : '#00FFFF'}
                        transparent
                        opacity={0.4}
                    />
                </mesh>
            ))}

            {/* Ceiling structure */}
            <mesh position={[0, 10, 0]}>
                <cylinderGeometry args={[15, 15, 0.5, 32]} />
                <meshStandardMaterial color="#0A0A0A" metalness={0.9} roughness={0.1} />
            </mesh>

            {/* Ceiling ring light */}
            <mesh position={[0, 9.7, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[10, 10.3, 64]} />
                <meshBasicMaterial color="#C9A227" transparent opacity={0.3} />
            </mesh>
        </>
    );
}
