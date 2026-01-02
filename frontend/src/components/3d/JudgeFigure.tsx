'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface JudgeFigureProps {
    position: [number, number, number];
    isActive: boolean;
    isSpeaking?: boolean;
}

export default function JudgeFigure({ position, isActive, isSpeaking = false }: JudgeFigureProps) {
    const groupRef = useRef<THREE.Group>(null);
    const gavelRef = useRef<THREE.Group>(null);
    const headRef = useRef<THREE.Group>(null);
    const scalesRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        const time = state.clock.elapsedTime;

        // Subtle floating
        if (groupRef.current) {
            groupRef.current.position.y = position[1] + Math.sin(time * 1.2) * 0.02;
        }

        // Head movement
        if (headRef.current) {
            headRef.current.rotation.y = Math.sin(time * 0.8) * 0.1;
        }

        // Gavel strike animation when speaking
        if (gavelRef.current) {
            if (isSpeaking) {
                gavelRef.current.rotation.z = -0.3 + Math.abs(Math.sin(time * 4)) * 0.4;
            } else {
                gavelRef.current.rotation.z = -0.2;
            }
        }

        // Scales balance animation
        if (scalesRef.current) {
            scalesRef.current.rotation.z = Math.sin(time * 2) * 0.08;
        }
    });

    const robeColor = '#1A0A15';
    const goldTrim = '#C9A227';
    const crimson = '#8B0000';
    const skinColor = '#D4A574';

    return (
        <group ref={groupRef} position={position}>
            {/* === ELEVATED PODIUM === */}
            <mesh position={[0, -2.3, 0]}>
                <cylinderGeometry args={[2, 2.5, 0.6, 8]} />
                <meshStandardMaterial color="#0F0F0F" metalness={0.9} roughness={0.1} />
            </mesh>

            {/* Podium steps */}
            <mesh position={[0, -2, 0]}>
                <cylinderGeometry args={[1.8, 2, 0.3, 8]} />
                <meshStandardMaterial color="#1A1A1A" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Gold trim on podium */}
            <mesh position={[0, -1.7, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[1.7, 1.9, 8]} />
                <meshBasicMaterial color={goldTrim} />
            </mesh>

            {/* Crimson accent ring */}
            <mesh position={[0, -1.85, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[1.9, 2.1, 8]} />
                <meshBasicMaterial color={crimson} transparent opacity={0.8} />
            </mesh>

            {/* === JUDGE BODY === */}
            {/* Robe - main body (flowing robes) */}
            <mesh position={[0, -0.8, 0]}>
                <coneGeometry args={[0.7, 1.8, 8]} />
                <meshStandardMaterial
                    color={robeColor}
                    metalness={0.2}
                    roughness={0.8}
                />
            </mesh>

            {/* Robe collar/shoulders */}
            <mesh position={[0, 0.1, 0]}>
                <cylinderGeometry args={[0.45, 0.5, 0.3, 16]} />
                <meshStandardMaterial color={robeColor} roughness={0.7} />
            </mesh>

            {/* Gold collar trim */}
            <mesh position={[0, 0.25, 0.15]} rotation={[0.3, 0, 0]}>
                <boxGeometry args={[0.6, 0.08, 0.15]} />
                <meshStandardMaterial color={goldTrim} metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Crimson sash */}
            <mesh position={[-0.25, -0.3, 0.35]} rotation={[0, 0, -0.3]}>
                <boxGeometry args={[0.15, 0.8, 0.05]} />
                <meshStandardMaterial color={crimson} roughness={0.6} />
            </mesh>

            {/* === ARMS === */}
            {/* Left arm (holding scales) */}
            <group position={[-0.5, -0.2, 0.2]}>
                <mesh rotation={[0.3, 0, 0.4]}>
                    <capsuleGeometry args={[0.08, 0.4, 8, 8]} />
                    <meshStandardMaterial color={robeColor} />
                </mesh>
                {/* Hand */}
                <mesh position={[-0.2, -0.3, 0.1]}>
                    <sphereGeometry args={[0.06, 16, 16]} />
                    <meshStandardMaterial color={skinColor} />
                </mesh>
            </group>

            {/* Right arm (holding gavel) */}
            <group ref={gavelRef} position={[0.5, -0.1, 0.2]}>
                <mesh rotation={[0.2, 0, -0.3]}>
                    <capsuleGeometry args={[0.08, 0.4, 8, 8]} />
                    <meshStandardMaterial color={robeColor} />
                </mesh>
                {/* Hand */}
                <mesh position={[0.15, -0.35, 0.1]}>
                    <sphereGeometry args={[0.06, 16, 16]} />
                    <meshStandardMaterial color={skinColor} />
                </mesh>
                {/* Gavel */}
                <group position={[0.25, -0.45, 0.15]}>
                    {/* Handle */}
                    <mesh rotation={[0, 0, 0.5]}>
                        <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
                        <meshStandardMaterial color="#4A3520" roughness={0.7} />
                    </mesh>
                    {/* Head */}
                    <mesh position={[0.1, 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
                        <cylinderGeometry args={[0.05, 0.05, 0.12, 16]} />
                        <meshStandardMaterial color="#2C1810" roughness={0.5} />
                    </mesh>
                    {/* Gold bands */}
                    <mesh position={[0.1, 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
                        <torusGeometry args={[0.05, 0.008, 8, 16]} />
                        <meshBasicMaterial color={goldTrim} />
                    </mesh>
                </group>
            </group>

            {/* === SCALES OF JUSTICE (held) === */}
            <group ref={scalesRef} position={[-0.8, 0.2, 0.3]}>
                {/* Center pillar */}
                <mesh>
                    <cylinderGeometry args={[0.015, 0.015, 0.5, 8]} />
                    <meshStandardMaterial color={goldTrim} metalness={0.9} roughness={0.1} />
                </mesh>

                {/* Balance beam */}
                <mesh position={[0, 0.25, 0]}>
                    <boxGeometry args={[0.6, 0.02, 0.02]} />
                    <meshStandardMaterial color={goldTrim} metalness={0.9} roughness={0.1} />
                </mesh>

                {/* Left pan */}
                <mesh position={[-0.27, 0.05, 0]}>
                    <cylinderGeometry args={[0.08, 0.08, 0.02, 16]} />
                    <meshStandardMaterial color={crimson} metalness={0.6} roughness={0.4} />
                </mesh>

                {/* Right pan */}
                <mesh position={[0.27, 0.05, 0]}>
                    <cylinderGeometry args={[0.08, 0.08, 0.02, 16]} />
                    <meshStandardMaterial color={crimson} metalness={0.6} roughness={0.4} />
                </mesh>

                {/* Chains */}
                <mesh position={[-0.27, 0.15, 0]}>
                    <cylinderGeometry args={[0.005, 0.005, 0.2, 4]} />
                    <meshStandardMaterial color={goldTrim} metalness={0.8} />
                </mesh>
                <mesh position={[0.27, 0.15, 0]}>
                    <cylinderGeometry args={[0.005, 0.005, 0.2, 4]} />
                    <meshStandardMaterial color={goldTrim} metalness={0.8} />
                </mesh>
            </group>

            {/* === HEAD === */}
            <group ref={headRef} position={[0, 0.55, 0]}>
                {/* Neck */}
                <mesh position={[0, -0.1, 0]}>
                    <cylinderGeometry args={[0.08, 0.1, 0.12, 16]} />
                    <meshStandardMaterial color={skinColor} />
                </mesh>

                {/* Head */}
                <mesh position={[0, 0.12, 0]}>
                    <sphereGeometry args={[0.2, 32, 32]} />
                    <meshStandardMaterial color={skinColor} roughness={0.6} />
                </mesh>

                {/* White wig (judge's traditional wig) */}
                <mesh position={[0, 0.25, -0.02]}>
                    <sphereGeometry args={[0.19, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                    <meshStandardMaterial color="#E8E8E8" roughness={0.9} />
                </mesh>

                {/* Wig curls - sides */}
                {[-1, 1].map((side, i) => (
                    <group key={i} position={[side * 0.18, 0.1, 0]}>
                        {[0, 1, 2].map((j) => (
                            <mesh key={j} position={[0, -j * 0.08, 0]}>
                                <sphereGeometry args={[0.05, 8, 8]} />
                                <meshStandardMaterial color="#E8E8E8" roughness={0.9} />
                            </mesh>
                        ))}
                    </group>
                ))}

                {/* Eyes */}
                <mesh position={[-0.07, 0.14, 0.17]}>
                    <sphereGeometry args={[0.03, 16, 16]} />
                    <meshStandardMaterial color="#FFFFFF" />
                </mesh>
                <mesh position={[0.07, 0.14, 0.17]}>
                    <sphereGeometry args={[0.03, 16, 16]} />
                    <meshStandardMaterial color="#FFFFFF" />
                </mesh>

                {/* Pupils */}
                <mesh position={[-0.07, 0.14, 0.195]}>
                    <sphereGeometry args={[0.015, 8, 8]} />
                    <meshBasicMaterial color="#2C1810" />
                </mesh>
                <mesh position={[0.07, 0.14, 0.195]}>
                    <sphereGeometry args={[0.015, 8, 8]} />
                    <meshBasicMaterial color="#2C1810" />
                </mesh>

                {/* Stern eyebrows */}
                <mesh position={[-0.07, 0.2, 0.16]} rotation={[0, 0, 0.15]}>
                    <boxGeometry args={[0.06, 0.015, 0.02]} />
                    <meshStandardMaterial color="#4A4A4A" />
                </mesh>
                <mesh position={[0.07, 0.2, 0.16]} rotation={[0, 0, -0.15]}>
                    <boxGeometry args={[0.06, 0.015, 0.02]} />
                    <meshStandardMaterial color="#4A4A4A" />
                </mesh>

                {/* Nose */}
                <mesh position={[0, 0.08, 0.18]}>
                    <boxGeometry args={[0.03, 0.06, 0.03]} />
                    <meshStandardMaterial color={skinColor} />
                </mesh>

                {/* Mouth */}
                <mesh position={[0, 0.02, 0.17]}>
                    <boxGeometry args={[0.06, 0.015, 0.02]} />
                    <meshStandardMaterial color="#8B5050" />
                </mesh>
            </group>

            {/* === AURA AND EFFECTS === */}
            {/* Authority glow */}
            {isActive && (
                <>
                    <pointLight position={[0, 1, 0.5]} intensity={15} distance={3} color={goldTrim} />

                    {/* Wisdom aura */}
                    <mesh position={[0, 0, 0]}>
                        <cylinderGeometry args={[1.2, 1.5, 3, 32, 1, true]} />
                        <meshBasicMaterial
                            color={goldTrim}
                            transparent
                            opacity={0.03}
                            side={THREE.DoubleSide}
                        />
                    </mesh>
                </>
            )}

            {/* Speaking indicator */}
            {isSpeaking && (
                <mesh position={[0, -1.5, 0.5]}>
                    <planeGeometry args={[0.4, 0.15]} />
                    <meshBasicMaterial color={crimson} transparent opacity={0.9} />
                </mesh>
            )}
        </group>
    );
}
