'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Text3D, Center } from '@react-three/drei';
import * as THREE from 'three';

interface DebaterAvatarProps {
    position: [number, number, number];
    type: 'human' | 'ai';
    name: string;
    isActive: boolean;
    isSpeaking: boolean;
}

export default function DebaterAvatar({ position, type, name, isActive, isSpeaking }: DebaterAvatarProps) {
    const groupRef = useRef<THREE.Group>(null);
    const glowRef = useRef<THREE.Mesh>(null);

    // Animation for speaking/active state
    useFrame((state) => {
        if (groupRef.current) {
            // Subtle floating animation
            groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.05;

            // Subtle rotation when active
            if (isActive) {
                groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
            }
        }

        // Pulsing glow when speaking
        if (glowRef.current && isSpeaking) {
            const scale = 1.1 + Math.sin(state.clock.elapsedTime * 4) * 0.1;
            glowRef.current.scale.setScalar(scale);
        }
    });

    const primaryColor = type === 'human' ? '#C9A227' : '#00FFFF';
    const secondaryColor = type === 'human' ? '#9A7B1C' : '#0088aa';

    return (
        <group ref={groupRef} position={position}>
            {/* Podium/Platform */}
            <mesh position={[0, -1.5, 0]}>
                <cylinderGeometry args={[1.2, 1.5, 0.3, 32]} />
                <meshStandardMaterial
                    color="#1A1A1A"
                    metalness={0.8}
                    roughness={0.2}
                />
            </mesh>

            {/* Podium Ring Light */}
            <mesh position={[0, -1.35, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[1.1, 1.3, 32]} />
                <meshBasicMaterial color={primaryColor} transparent opacity={0.8} />
            </mesh>

            {/* Avatar Body - Abstract geometric shape */}
            <mesh position={[0, 0, 0]}>
                <dodecahedronGeometry args={[0.8, 0]} />
                <meshStandardMaterial
                    color={secondaryColor}
                    metalness={0.6}
                    roughness={0.3}
                    emissive={primaryColor}
                    emissiveIntensity={isActive ? 0.3 : 0.1}
                />
            </mesh>

            {/* Inner Core - Glowing sphere */}
            <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[0.5, 32, 32]} />
                <meshBasicMaterial
                    color={primaryColor}
                    transparent
                    opacity={0.6}
                />
            </mesh>

            {/* Speaking Glow Ring */}
            {isSpeaking && (
                <mesh ref={glowRef} position={[0, 0, 0]}>
                    <torusGeometry args={[1, 0.05, 16, 32]} />
                    <meshBasicMaterial color={primaryColor} transparent opacity={0.8} />
                </mesh>
            )}

            {/* Head/Face - Holographic display */}
            <mesh position={[0, 0.9, 0]}>
                <sphereGeometry args={[0.4, 32, 32]} />
                <meshStandardMaterial
                    color={primaryColor}
                    metalness={0.9}
                    roughness={0.1}
                    emissive={primaryColor}
                    emissiveIntensity={0.2}
                />
            </mesh>

            {/* Eyes */}
            <mesh position={[-0.15, 0.95, 0.3]}>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshBasicMaterial color="#FFFFFF" />
            </mesh>
            <mesh position={[0.15, 0.95, 0.3]}>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshBasicMaterial color="#FFFFFF" />
            </mesh>

            {/* Type Icon above head */}
            <mesh position={[0, 1.6, 0]}>
                {type === 'human' ? (
                    <octahedronGeometry args={[0.2, 0]} />
                ) : (
                    <boxGeometry args={[0.3, 0.3, 0.3]} />
                )}
                <meshBasicMaterial color={primaryColor} />
            </mesh>

            {/* Active Indicator Ring */}
            {isActive && (
                <mesh position={[0, -1.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[1.5, 1.7, 32]} />
                    <meshBasicMaterial color={primaryColor} transparent opacity={0.5} />
                </mesh>
            )}

            {/* Name Label - Using HTML overlay instead of 3D text for better rendering */}
        </group>
    );
}
