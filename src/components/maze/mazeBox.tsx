/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as THREE from "three";
import {SpringValue, animated} from "@react-spring/three";
import {Base, Geometry, Addition, Subtraction} from "@react-three/csg";
import {forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState} from "react";
import {RapierRigidBody, RigidBody} from "@react-three/rapier";
import {useFrame} from "@react-three/fiber";
import {useTexture} from "@react-three/drei";
import {CheckPoints, CheckPointsRef} from "./checkPoints.tsx";
import {Group} from "three";
import {CELL_SIZE, CELLS, HALF_CELL_SIZE, HALF_MAZE_SIZE, NUM_CELLS, WALL_HEIGHT} from "./mazeConstants.ts";
import {Button, ButtonControls, ButtonPressedEvent} from "./buttonControls.tsx";

const BASE_COLOR = 0xEEEEEE;
const WALL_COLOR = 0x555555;

const MESH_POSITION: THREE.Vector3 = new THREE.Vector3(0,-0.5,0);

const ROTATION_ANGLE = Math.PI * 0.05;
const BUTTON_ROTATIONS: Map<Button, THREE.Vector3> = new Map([
  ['top-left',     new THREE.Vector3(-ROTATION_ANGLE, 0, ROTATION_ANGLE)],
  ['top',          new THREE.Vector3(-ROTATION_ANGLE, 0, 0)],
  ['top-right',    new THREE.Vector3(-ROTATION_ANGLE, 0, -ROTATION_ANGLE)],
  ['left',         new THREE.Vector3(0,               0, ROTATION_ANGLE)],
  ['center',       new THREE.Vector3(0,               0, 0)],
  ['right',        new THREE.Vector3(0,               0, -ROTATION_ANGLE)],
  ['bottom-left',  new THREE.Vector3(ROTATION_ANGLE,  0, ROTATION_ANGLE)],
  ['bottom',       new THREE.Vector3(ROTATION_ANGLE,  0, 0)],
  ['bottom-right', new THREE.Vector3(ROTATION_ANGLE,  0, -ROTATION_ANGLE)]
]);

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
  onCheckPointCompleted: (checkPointNumber: number) => void
};

const MazeBox = forwardRef<MazeBoxRef, MazeBoxProps>(({ opacity, onCheckPointCompleted }: MazeBoxProps, ref) => {
  const rigidBodyRef = useRef<RapierRigidBody>(null!);
  const rigidBodyRotation = useRef(new THREE.Vector3(0,0,0));
  const checkPointsGroupRef = useRef<Group>(null!);
  const checkPointerGroupEuler = useRef(new THREE.Euler(0,0,0));
  const checkPoints = useRef<CheckPointsRef>(null!);
  const desiredRotation= useRef(new THREE.Vector3(0,0,0));
  const [allowRotation, setAllowRotation] = useState(false);

  const onButtonPressed = useCallback((event: ButtonPressedEvent) => {
    const rotation = BUTTON_ROTATIONS.get(event.button) as THREE.Vector3;
    desiredRotation.current.set(rotation.x, rotation.y, rotation.z);
  }, []);

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
            <ButtonControls onButtonPressed={onButtonPressed}/>
          </RigidBody>
          <group ref={checkPointsGroupRef}>
            <CheckPoints ref={checkPoints} opacity={opacity} onCheckPointCompleted={onCheckPointCompleted}/>
          </group>
        </>
      )}
    </>
  )
});

export { MazeBox }