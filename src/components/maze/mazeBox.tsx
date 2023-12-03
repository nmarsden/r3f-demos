/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as THREE from "three";
import {SpringValue, animated} from "@react-spring/three";
import {Base, Geometry, Addition, Subtraction} from "@react-three/csg";
import {useEffect, useRef, useState} from "react";
import {RapierRigidBody, RigidBody} from "@react-three/rapier";
import {useFrame} from "@react-three/fiber";
import {useTexture} from "@react-three/drei";

const BASE_COLOR = 0xEEEEEE;
const WALL_COLOR = 0x555555;

const MAZE_SIZE = 5;
const HALF_MAZE_SIZE = MAZE_SIZE * 0.5;
const NUM_CELLS = 11;
const CELL_SIZE = MAZE_SIZE / NUM_CELLS;
const HALF_CELL_SIZE = CELL_SIZE * 0.5;

const WALL_HEIGHT = 0.5;


// Maze: 11 x 11
const CELLS = [
   1,1,1,1,1,1,1,2,1,1,1,
   2,0,0,0,0,0,0,0,1,0,1,
   1,0,1,1,1,2,1,0,1,0,1,
   1,0,2,0,0,0,1,0,1,0,1,
   1,0,1,0,1,0,1,0,1,0,1,
   1,0,1,0,1,0,1,0,1,0,1,
   1,0,1,0,1,1,1,0,1,0,1,
   1,0,1,0,0,0,0,0,2,0,1,
   1,0,1,2,1,1,1,1,1,0,1,
   1,0,0,0,0,0,0,0,0,0,2,
   1,2,1,1,1,1,1,1,1,1,1,
];

const POSITION: THREE.Vector3 = new THREE.Vector3(0,-0.5,0);

const InternalMazeBox = ({ opacity }: { opacity: SpringValue }) => {
  const texture = useTexture('/r3f-demos/maze/maze-texture.png')

  return (
    <mesh position={POSITION}>
      <Geometry useGroups={true}>
        {/* Base */}
        <Base>
          <boxGeometry args={[5, 0.25, 5]} />
          {/* @ts-ignore */}
          <animated.meshStandardMaterial
            map={texture}
            metalness={0.45}
            roughness={0.75}
            color={BASE_COLOR}
            transparent={true}
            opacity={opacity}
          />
        </Base>

        {CELLS.map((cell, index) => {
          const row = Math.floor(index / NUM_CELLS);
          const col = index % NUM_CELLS;
          const x = col * CELL_SIZE - HALF_MAZE_SIZE + HALF_CELL_SIZE;
          const z = row * CELL_SIZE - HALF_MAZE_SIZE + HALF_CELL_SIZE;
          return cell === 1 ?
            // Wall
            <Addition key={`${index}`} position={[x, WALL_HEIGHT/2 + 0.126, z]}>
              <boxGeometry args={[CELL_SIZE, WALL_HEIGHT, CELL_SIZE]}/>
              <animated.meshStandardMaterial
                metalness={0.55}
                roughness={0.75}
                color={WALL_COLOR}
                transparent={true}
                opacity={opacity}
              />
            </Addition>
          : cell === 2 ?
            // Hole
            <Subtraction key={`${index}`} position={[x, 0, z]}>
              <boxGeometry args={[CELL_SIZE, WALL_HEIGHT, CELL_SIZE]}/>
              <animated.meshStandardMaterial
                metalness={0.55}
                roughness={0.75}
                color={WALL_COLOR}
                transparent={true}
                opacity={opacity}
              />
            </Subtraction>
          : null
        })}
      </Geometry>
    </mesh>
  )
}

const MazeBox = ({ opacity, rotationX, rotationZ }: { opacity: SpringValue, rotationX: number, rotationZ: number }) => {
  const rigidBodyRef = useRef<RapierRigidBody>(null!);
  const rotation = useRef(new THREE.Vector3(0,0,0));
  const desiredRotation= useRef(new THREE.Vector3(0,0,0));
  const [allowRotation, setAllowRotation] = useState(false);

  useEffect(() => {
    if (opacity.isAnimating) {
      setAllowRotation(false)
    } else {
      setTimeout(() => setAllowRotation(true), 300);
    }
  }, [opacity.isAnimating]);

  useEffect(() => {
    desiredRotation.current.set(rotationX, 0, rotationZ);
  }, [rotationX, rotationZ]);

  useFrame(() => {
    if (opacity.isAnimating || !allowRotation) return;

    rotation.current.lerp(desiredRotation.current, 0.05);
    rigidBodyRef.current.setRotation({x: rotation.current.x, y: 0, z: rotation.current.z, w: 1}, true);
  })

  return (
    <>
      {opacity.isAnimating ? (
        <InternalMazeBox opacity={opacity} />
      ) : (
        <RigidBody ref={rigidBodyRef} type={'dynamic'} colliders={'trimesh'} gravityScale={0} density={1000}>
          <InternalMazeBox opacity={opacity} />
        </RigidBody>
      )}
    </>
  )
}

export { MazeBox }