/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as THREE from "three";
import {SpringValue, animated} from "@react-spring/three";
import {Base, Geometry, Addition, Subtraction} from "@react-three/csg";
import {forwardRef, useEffect, useImperativeHandle, useRef, useState} from "react";
import {RapierRigidBody, RigidBody} from "@react-three/rapier";
import {useFrame} from "@react-three/fiber";
import {useTexture} from "@react-three/drei";
import {CheckPoints, CheckPointsRef} from "./checkPoints.tsx";
import {Group} from "three";
import {CELL_SIZE, CELLS, HALF_CELL_SIZE, HALF_MAZE_SIZE, NUM_CELLS, WALL_HEIGHT} from "./mazeConstants.ts";

const BASE_COLOR = 0xEEEEEE;
const WALL_COLOR = 0x555555;

const MESH_POSITION: THREE.Vector3 = new THREE.Vector3(0,-0.5,0);

const InternalMazeBox = ({ opacity }: { opacity: SpringValue }) => {
  const texture = useTexture('/r3f-demos/maze/maze-texture.png')

  return (
    <mesh position={MESH_POSITION}>
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

export type MazeBoxRef = {
  reset: () => void
} | null;

type MazeBoxProps = {
  opacity: SpringValue,
  rotationX: number,
  rotationZ: number
};

const MazeBox = forwardRef<MazeBoxRef, MazeBoxProps>(({ opacity, rotationX, rotationZ }: MazeBoxProps, ref) => {
  const rigidBodyRef = useRef<RapierRigidBody>(null!);
  const rigidBodyRotation = useRef(new THREE.Vector3(0,0,0));
  const checkPointsGroupRef = useRef<Group>(null!);
  const checkPointerGroupEuler = useRef(new THREE.Euler(0,0,0));
  const checkPoints = useRef<CheckPointsRef>(null!);
  const desiredRotation= useRef(new THREE.Vector3(0,0,0));
  const [allowRotation, setAllowRotation] = useState(false);

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (checkPoints.current) {
        checkPoints.current.reset();
      }
    }
  }));

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

    rigidBodyRotation.current.lerp(desiredRotation.current, 0.05);
    checkPointerGroupEuler.current.setFromVector3(rigidBodyRotation.current);

    rigidBodyRef.current.setRotation({x: rigidBodyRotation.current.x, y: 0, z: rigidBodyRotation.current.z, w: 2}, true);

    checkPointsGroupRef.current.setRotationFromEuler(checkPointerGroupEuler.current);
  })

  return (
    <>
      {opacity.isAnimating ? (
        <InternalMazeBox opacity={opacity} />
      ) : (
        <>
          <RigidBody ref={rigidBodyRef} type={'dynamic'} colliders={'trimesh'} gravityScale={0} mass={0} density={0}>
            <InternalMazeBox opacity={opacity} />
          </RigidBody>
          <group ref={checkPointsGroupRef}>
            <CheckPoints ref={checkPoints} opacity={opacity} />
          </group>
        </>
      )}
    </>
  )
});

export { MazeBox }