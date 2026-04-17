'use client';
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  Float, 
  MeshTransmissionMaterial, 
  Environment, 
  ContactShadows,
  PerspectiveCamera
} from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

interface RobotProps {
  isPasswordFocused: boolean;
}

function RobotHead({ isPasswordFocused }: RobotProps) {
  const headRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const { mouse, viewport } = useThree();

  // Target rotation for normal tracking
  const targetRotation = useRef(new THREE.Euler());
  
  useFrame((state) => {
    if (!headRef.current) return;

    if (isPasswordFocused) {
      // Rotate 180 degrees away
      targetRotation.current.set(0, Math.PI, 0);
    } else {
      // Track mouse position
      // We scale the rotation based on viewport size
      const x = (mouse.x * viewport.width) / 15;
      const y = (mouse.y * viewport.height) / 15;
      targetRotation.current.set(-y, x, 0);
    }

    // Smooth lerp to target
    headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, targetRotation.current.x, 0.1);
    headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetRotation.current.y, 0.1);
    
    // Subtle breathing/floating is handled by <Float /> but we add some head tilt
    headRef.current.rotation.z = THREE.MathUtils.lerp(headRef.current.rotation.z, Math.sin(state.clock.elapsedTime) * 0.05, 0.05);

    // Eyes tracking
    if (!isPasswordFocused && leftEyeRef.current && rightEyeRef.current) {
        const eyeX = mouse.x * 0.2;
        const eyeY = mouse.y * 0.2;
        leftEyeRef.current.position.x = THREE.MathUtils.lerp(leftEyeRef.current.position.x, -0.3 + eyeX, 0.2);
        leftEyeRef.current.position.y = THREE.MathUtils.lerp(leftEyeRef.current.position.y, 0.1 + eyeY, 0.2);
        rightEyeRef.current.position.x = THREE.MathUtils.lerp(rightEyeRef.current.position.x, 0.3 + eyeX, 0.2);
        rightEyeRef.current.position.y = THREE.MathUtils.lerp(rightEyeRef.current.position.y, 0.1 + eyeY, 0.2);
    }
  });

  return (
    <group ref={headRef}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        {/* Main Head - Frosted Glass Box */}
        <mesh castShadow>
          <boxGeometry args={[1.2, 1.2, 1]} />
          <MeshTransmissionMaterial 
            backside
            samples={4}
            thickness={0.5}
            chromaticAberration={0.05}
            anisotropy={0.1}
            distortion={0.1}
            distortionScale={0.1}
            temporalDistortion={0.1}
            transmission={1}
            roughness={0.15}
          />
        </mesh>

        {/* Inner Core / Brain */}
        <mesh position={[0, 0, -0.1]}>
          <boxGeometry args={[0.6, 0.6, 0.6]} />
          <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={2} />
        </mesh>

        {/* Eyes */}
        {!isPasswordFocused && (
            <>
                <mesh ref={leftEyeRef} position={[-0.3, 0.1, 0.51]}>
                    <planeGeometry args={[0.2, 0.2]} />
                    <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={4} />
                </mesh>
                <mesh ref={rightEyeRef} position={[0.3, 0.1, 0.51]}>
                    <planeGeometry args={[0.2, 0.2]} />
                    <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={4} />
                </mesh>
            </>
        )}
        
        {/* "Antenna" or Detail */}
        <mesh position={[0, 0.7, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.3]} />
            <meshStandardMaterial color="#334155" />
        </mesh>
        <mesh position={[0, 0.85, 0]}>
            <sphereGeometry args={[0.05]} />
            <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={1} />
        </mesh>
      </Float>
    </group>
  );
}

export default function WatcherRobot({ isPasswordFocused }: RobotProps) {
  return (
    <div className="flex flex-col items-center select-none w-[200px] h-[300px] relative">
      <div className="w-full h-full">
        <Canvas shadows gl={{ antialias: true, alpha: true }}>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={35} />
          
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          <RobotHead isPasswordFocused={isPasswordFocused} />
          
          <Environment preset="city" />
          <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2} far={4} />
        </Canvas>
      </div>

      {/* Caption bubble */}
      <AnimatePresence mode="wait">
        <motion.div
            key={isPasswordFocused ? 'hidden' : 'watching'}
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="absolute -bottom-4 px-5 py-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl z-20 pointer-events-none"
        >
            <p className="text-[12px] font-bold text-white text-center tracking-tight drop-shadow-sm whitespace-nowrap">
            {isPasswordFocused ? "Privacy Mode Active" : "Scanning Secure Perimeter"}
            </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
