"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, PerspectiveCamera, Stars } from "@react-three/drei";
import * as THREE from "three";

function SpeedTunnel() {
    const mesh = useRef<THREE.InstancedMesh>(null);
    const count = 300;

    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Initialize particles in a tunnel shape
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const angle = (Math.random() * Math.PI * 2);
            const radius = 10 + Math.random() * 20; // Tunnel radius
            const z = Math.random() * 100 - 50; // Spread along Z
            const speed = 0.2 + Math.random() * 0.5;
            temp.push({ angle, radius, z, speed });
        }
        return temp;
    }, []);

    useFrame((state) => {
        if (!mesh.current) return;

        particles.forEach((p, i) => {
            // Move particles towards camera to simulate forward speed
            p.z += p.speed;
            if (p.z > 20) p.z = -80; // Reset significantly behind

            const x = Math.cos(p.angle) * p.radius;
            const y = Math.sin(p.angle) * p.radius;

            // Add some "road" feel by flattening bottom
            let finalY = y;
            if (y < -5) finalY = -5 - Math.random();

            dummy.position.set(x, finalY, p.z);

            // Streaks
            dummy.scale.set(0.1, 0.1, 5 + p.speed * 10);
            dummy.rotation.set(0, 0, 0);

            dummy.updateMatrix();
            mesh.current!.setMatrixAt(i, dummy.matrix);
        });
        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color="#44aaff" transparent opacity={0.6} />
        </instancedMesh>
    );
}

function GridFloor() {
    return (
        <gridHelper args={[200, 50, 0x444444, 0x222222]} position={[0, -5, 0]} />
    )
}

export default function Scene3D() {
    return (
        <div className="absolute inset-0 -z-10 bg-black">
            <Canvas>
                <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={60} />
                <fog attach="fog" args={['#000', 5, 50]} />
                <SpeedTunnel />
                <GridFloor />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <Environment preset="city" />
            </Canvas>
        </div>
    );
}
