'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface HumanoidAvatarProps {
    position: [number, number, number];
    type: 'human' | 'ai';
    name: string;
    isActive: boolean;
    isSpeaking: boolean;
}

export default function HumanoidAvatar({ position, type, name, isActive, isSpeaking }: HumanoidAvatarProps) {
    const groupRef = useRef<THREE.Group>(null);
    const headRef = useRef<THREE.Group>(null);
    const leftArmRef = useRef<THREE.Group>(null);
    const rightArmRef = useRef<THREE.Group>(null);
    const mouthRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        const time = state.clock.elapsedTime;

        if (groupRef.current) {
            // Subtle breathing animation
            groupRef.current.position.y = position[1] + Math.sin(time * 1.5) * 0.02;
        }

        if (headRef.current) {
            // Head movement when speaking or listening
            if (isSpeaking) {
                headRef.current.rotation.y = Math.sin(time * 2) * 0.1;
                headRef.current.rotation.x = Math.sin(time * 3) * 0.05;
            } else if (isActive) {
                headRef.current.rotation.y = Math.sin(time * 0.5) * 0.15;
            }
        }

        // Arm gestures when speaking
        if (leftArmRef.current && rightArmRef.current) {
            if (isSpeaking) {
                leftArmRef.current.rotation.x = -0.3 + Math.sin(time * 2.5) * 0.2;
                rightArmRef.current.rotation.x = -0.3 + Math.sin(time * 2.5 + 1) * 0.2;
                leftArmRef.current.rotation.z = 0.2 + Math.sin(time * 2) * 0.1;
                rightArmRef.current.rotation.z = -0.2 - Math.sin(time * 2) * 0.1;
            } else {
                leftArmRef.current.rotation.x = 0;
                rightArmRef.current.rotation.x = 0;
                leftArmRef.current.rotation.z = 0.15;
                rightArmRef.current.rotation.z = -0.15;
            }
        }

        // Mouth animation when speaking
        if (mouthRef.current && isSpeaking) {
            mouthRef.current.scale.y = 0.8 + Math.abs(Math.sin(time * 8)) * 0.6;
        }
    });

    // Color schemes
    const skinColor = type === 'human' ? '#E0B090' : '#4A90D9';
    const primaryColor = type === 'human' ? '#C9A227' : '#00FFFF';
    const secondaryColor = type === 'human' ? '#2C1810' : '#0A2035';
    const clothingColor = type === 'human' ? '#1A1A2E' : '#0F1923';
    const hairColor = type === 'human' ? '#2C1810' : '#00CCCC';
    const glowIntensity = isActive ? 0.3 : 0.1;

    return (
        <group ref={groupRef} position={position}>
            {/* Platform/Podium */}
            <mesh position={[0, -1.8, 0]}>
                <cylinderGeometry args={[1.3, 1.5, 0.4, 32]} />
                <meshStandardMaterial
                    color="#1A1A1A"
                    metalness={0.9}
                    roughness={0.1}
                />
            </mesh>

            {/* Platform glow ring */}
            <mesh position={[0, -1.55, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[1.2, 1.4, 32]} />
                <meshBasicMaterial color={primaryColor} transparent opacity={isActive ? 0.9 : 0.5} />
            </mesh>

            {/* === BODY === */}
            {/* Torso */}
            <mesh position={[0, -0.2, 0]}>
                <capsuleGeometry args={[0.35, 0.6, 8, 16]} />
                <meshStandardMaterial
                    color={clothingColor}
                    metalness={type === 'ai' ? 0.6 : 0.2}
                    roughness={type === 'ai' ? 0.3 : 0.7}
                />
            </mesh>

            {/* Chest highlight/logo area */}
            <mesh position={[0, 0, 0.36]}>
                <circleGeometry args={[0.15, 16]} />
                <meshBasicMaterial
                    color={primaryColor}
                    transparent
                    opacity={0.8}
                />
            </mesh>

            {/* Shoulders */}
            <mesh position={[0, 0.25, 0]}>
                <boxGeometry args={[0.95, 0.15, 0.35]} />
                <meshStandardMaterial
                    color={clothingColor}
                    metalness={type === 'ai' ? 0.6 : 0.2}
                    roughness={0.4}
                />
            </mesh>

            {/* === ARMS === */}
            {/* Left Arm */}
            <group ref={leftArmRef} position={[-0.5, 0.1, 0]}>
                {/* Upper arm */}
                <mesh position={[-0.1, -0.25, 0]} rotation={[0, 0, 0.15]}>
                    <capsuleGeometry args={[0.08, 0.35, 8, 8]} />
                    <meshStandardMaterial
                        color={type === 'ai' ? '#0A2035' : clothingColor}
                        metalness={type === 'ai' ? 0.7 : 0.1}
                        roughness={0.4}
                    />
                </mesh>
                {/* Lower arm/hand */}
                <mesh position={[-0.15, -0.55, 0.05]} rotation={[0.2, 0, 0.1]}>
                    <capsuleGeometry args={[0.06, 0.3, 8, 8]} />
                    <meshStandardMaterial
                        color={skinColor}
                        metalness={type === 'ai' ? 0.5 : 0.1}
                        roughness={0.5}
                    />
                </mesh>
                {/* Hand */}
                <mesh position={[-0.18, -0.78, 0.08]}>
                    <sphereGeometry args={[0.07, 16, 16]} />
                    <meshStandardMaterial color={skinColor} />
                </mesh>
            </group>

            {/* Right Arm */}
            <group ref={rightArmRef} position={[0.5, 0.1, 0]}>
                {/* Upper arm */}
                <mesh position={[0.1, -0.25, 0]} rotation={[0, 0, -0.15]}>
                    <capsuleGeometry args={[0.08, 0.35, 8, 8]} />
                    <meshStandardMaterial
                        color={type === 'ai' ? '#0A2035' : clothingColor}
                        metalness={type === 'ai' ? 0.7 : 0.1}
                        roughness={0.4}
                    />
                </mesh>
                {/* Lower arm/hand */}
                <mesh position={[0.15, -0.55, 0.05]} rotation={[0.2, 0, -0.1]}>
                    <capsuleGeometry args={[0.06, 0.3, 8, 8]} />
                    <meshStandardMaterial
                        color={skinColor}
                        metalness={type === 'ai' ? 0.5 : 0.1}
                        roughness={0.5}
                    />
                </mesh>
                {/* Hand */}
                <mesh position={[0.18, -0.78, 0.08]}>
                    <sphereGeometry args={[0.07, 16, 16]} />
                    <meshStandardMaterial color={skinColor} />
                </mesh>
            </group>

            {/* === LEGS === */}
            {/* Left Leg */}
            <mesh position={[-0.15, -0.9, 0]}>
                <capsuleGeometry args={[0.1, 0.5, 8, 8]} />
                <meshStandardMaterial color={secondaryColor} metalness={0.2} roughness={0.6} />
            </mesh>

            {/* Right Leg */}
            <mesh position={[0.15, -0.9, 0]}>
                <capsuleGeometry args={[0.1, 0.5, 8, 8]} />
                <meshStandardMaterial color={secondaryColor} metalness={0.2} roughness={0.6} />
            </mesh>

            {/* Feet */}
            <mesh position={[-0.15, -1.35, 0.05]}>
                <boxGeometry args={[0.12, 0.08, 0.2]} />
                <meshStandardMaterial color="#1A1A1A" />
            </mesh>
            <mesh position={[0.15, -1.35, 0.05]}>
                <boxGeometry args={[0.12, 0.08, 0.2]} />
                <meshStandardMaterial color="#1A1A1A" />
            </mesh>

            {/* === HEAD === */}
            <group ref={headRef} position={[0, 0.65, 0]}>
                {/* Neck */}
                <mesh position={[0, -0.15, 0]}>
                    <cylinderGeometry args={[0.08, 0.1, 0.15, 16]} />
                    <meshStandardMaterial color={skinColor} />
                </mesh>

                {/* Head base */}
                <mesh position={[0, 0.15, 0]}>
                    <sphereGeometry args={[0.25, 32, 32]} />
                    <meshStandardMaterial
                        color={skinColor}
                        metalness={type === 'ai' ? 0.3 : 0.05}
                        roughness={type === 'ai' ? 0.4 : 0.7}
                    />
                </mesh>

                {/* Hair (Human) or Tech Crown (AI) */}
                {type === 'human' ? (
                    <>
                        {/* Hair - top */}
                        <mesh position={[0, 0.32, -0.02]}>
                            <sphereGeometry args={[0.23, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                            <meshStandardMaterial color={hairColor} roughness={0.8} />
                        </mesh>
                        {/* Hair - side left */}
                        <mesh position={[-0.18, 0.2, 0]}>
                            <sphereGeometry args={[0.1, 8, 8]} />
                            <meshStandardMaterial color={hairColor} roughness={0.8} />
                        </mesh>
                        {/* Hair - side right */}
                        <mesh position={[0.18, 0.2, 0]}>
                            <sphereGeometry args={[0.1, 8, 8]} />
                            <meshStandardMaterial color={hairColor} roughness={0.8} />
                        </mesh>
                    </>
                ) : (
                    <>
                        {/* AI Tech Crown */}
                        <mesh position={[0, 0.35, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                            <torusGeometry args={[0.2, 0.02, 8, 32]} />
                            <meshBasicMaterial color={primaryColor} />
                        </mesh>
                        {/* Tech nodes */}
                        {[0, 1, 2, 3].map((i) => (
                            <mesh
                                key={i}
                                position={[
                                    Math.cos(i * Math.PI / 2) * 0.2,
                                    0.35,
                                    Math.sin(i * Math.PI / 2) * 0.2
                                ]}
                            >
                                <sphereGeometry args={[0.03, 8, 8]} />
                                <meshBasicMaterial color={primaryColor} />
                            </mesh>
                        ))}
                        {/* Circuit lines on face */}
                        <mesh position={[-0.2, 0.15, 0.12]} rotation={[0, 0.3, 0]}>
                            <boxGeometry args={[0.02, 0.15, 0.01]} />
                            <meshBasicMaterial color={primaryColor} transparent opacity={0.6} />
                        </mesh>
                        <mesh position={[0.2, 0.15, 0.12]} rotation={[0, -0.3, 0]}>
                            <boxGeometry args={[0.02, 0.15, 0.01]} />
                            <meshBasicMaterial color={primaryColor} transparent opacity={0.6} />
                        </mesh>
                    </>
                )}

                {/* Eyes */}
                {/* Eye sockets */}
                <mesh position={[-0.08, 0.18, 0.2]}>
                    <sphereGeometry args={[0.045, 16, 16]} />
                    <meshStandardMaterial color="#FFFFFF" />
                </mesh>
                <mesh position={[0.08, 0.18, 0.2]}>
                    <sphereGeometry args={[0.045, 16, 16]} />
                    <meshStandardMaterial color="#FFFFFF" />
                </mesh>

                {/* Pupils */}
                <mesh position={[-0.08, 0.18, 0.24]}>
                    <sphereGeometry args={[0.025, 16, 16]} />
                    <meshBasicMaterial color={type === 'ai' ? primaryColor : '#2C1810'} />
                </mesh>
                <mesh position={[0.08, 0.18, 0.24]}>
                    <sphereGeometry args={[0.025, 16, 16]} />
                    <meshBasicMaterial color={type === 'ai' ? primaryColor : '#2C1810'} />
                </mesh>

                {/* Eye glow for AI */}
                {type === 'ai' && (
                    <>
                        <pointLight position={[-0.08, 0.18, 0.25]} intensity={2} distance={0.5} color={primaryColor} />
                        <pointLight position={[0.08, 0.18, 0.25]} intensity={2} distance={0.5} color={primaryColor} />
                    </>
                )}

                {/* Eyebrows */}
                <mesh position={[-0.08, 0.26, 0.18]} rotation={[0, 0, 0.1]}>
                    <boxGeometry args={[0.08, 0.015, 0.02]} />
                    <meshStandardMaterial color={type === 'ai' ? primaryColor : hairColor} />
                </mesh>
                <mesh position={[0.08, 0.26, 0.18]} rotation={[0, 0, -0.1]}>
                    <boxGeometry args={[0.08, 0.015, 0.02]} />
                    <meshStandardMaterial color={type === 'ai' ? primaryColor : hairColor} />
                </mesh>

                {/* Nose */}
                <mesh position={[0, 0.1, 0.23]}>
                    <boxGeometry args={[0.04, 0.08, 0.04]} />
                    <meshStandardMaterial color={skinColor} />
                </mesh>

                {/* Mouth */}
                <mesh ref={mouthRef} position={[0, 0.02, 0.22]}>
                    <boxGeometry args={[0.08, 0.02, 0.02]} />
                    <meshStandardMaterial
                        color={type === 'ai' ? primaryColor : '#8B4040'}
                    />
                </mesh>

                {/* Ears */}
                <mesh position={[-0.25, 0.15, 0]}>
                    <sphereGeometry args={[0.04, 8, 8]} />
                    <meshStandardMaterial color={skinColor} />
                </mesh>
                <mesh position={[0.25, 0.15, 0]}>
                    <sphereGeometry args={[0.04, 8, 8]} />
                    <meshStandardMaterial color={skinColor} />
                </mesh>
            </group>

            {/* Speaking glow effect */}
            {isSpeaking && (
                <mesh position={[0, 0.65, 0.3]}>
                    <sphereGeometry args={[0.4, 16, 16]} />
                    <meshBasicMaterial
                        color={primaryColor}
                        transparent
                        opacity={0.15}
                    />
                </mesh>
            )}

            {/* Active aura */}
            {isActive && (
                <mesh position={[0, 0, 0]}>
                    <cylinderGeometry args={[0.8, 1, 2.5, 32, 1, true]} />
                    <meshBasicMaterial
                        color={primaryColor}
                        transparent
                        opacity={0.05}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            )}
        </group>
    );
}
