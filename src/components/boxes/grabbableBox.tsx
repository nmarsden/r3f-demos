/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as THREE from "three";
import {animated, SpringValue} from "@react-spring/three";
import {useCallback, useContext, useEffect, useLayoutEffect, useRef, useState} from "react";
import {RapierRigidBody, RigidBody, vec3} from "@react-three/rapier";
import {ThreeEvent, useFrame} from "@react-three/fiber";
import {Box} from "@react-three/drei";
import {MainContext} from "../../mainContext";

const vector = new THREE.Vector3()
const grabbedIntersectPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)

type BoxState = 'NONE' | 'SPAWNED' | 'RISING' | 'FLOATING' | 'FALLING' | 'EXPLODED';

export type HoveredChangeEvent = {
  isHovered: boolean;
}

export type GrabbedChangeEvent = {
  isGrabbed: boolean;
}

type GrabbableBoxProps = {
  boxId: string;
  opacity: SpringValue;
  isShown: boolean;
  canGrab: boolean;
  onHoveredChanged: (event: HoveredChangeEvent) => void;
  onGrabbedChanged: (event: GrabbedChangeEvent) => void;
  isExploded: boolean;
}

// TODO ensure desiredPosX is correctly calculated when viewing from above
const GrabbableBox = ({ boxId, opacity, isShown, canGrab, onHoveredChanged, onGrabbedChanged, isExploded }: GrabbableBoxProps) => {
  const mainContext = useContext(MainContext)
  const rigidBodyRef = useRef<RapierRigidBody>(null!);
  const boxRef = useRef<THREE.Mesh>(null!);
  const [isGrabbed, setIsGrabbed] = useState(false);
  const [boxState, setBoxState] = useState<BoxState>('NONE');
  const [desiredPosX, setDesiredPosX] = useState<number>(0);

  const onPointerDown = useCallback((event: ThreeEvent<PointerEvent>): void => {
    event.stopPropagation();
    if (!canGrab) return;
    if (mainContext.controls !== null && mainContext.controls?.current !== null) {
      mainContext.controls.current.enabled = false;
    }
    setIsGrabbed(true)
    setBoxState('RISING')
    onHoveredChanged({ isHovered: false })
    // @ts-ignore
    event.target.setPointerCapture(event.pointerId)
    onGrabbedChanged({ isGrabbed: true })

  }, [canGrab, isGrabbed])

  const onPointerUp = useCallback((event: ThreeEvent<PointerEvent>): void => {
    if (!canGrab) return;
    if (mainContext.controls !== null && mainContext.controls?.current !== null) {
      mainContext.controls.current.enabled = true;
    }
    setIsGrabbed(false)
    setBoxState('FALLING')
    // @ts-ignore
    event.target.releasePointerCapture(event.pointerId)
    onGrabbedChanged({ isGrabbed: false })

  }, [canGrab, isGrabbed])

  const onPointerMove = useCallback((event: ThreeEvent<PointerEvent>): void => {
    if (!canGrab) return;
    if (isGrabbed && event.ray.intersectPlane(grabbedIntersectPlane, vector)) {
      vector.clampScalar(-4, 4);
      setDesiredPosX(vector.x);
    }
  }, [canGrab, isGrabbed])

  const onPointerOver = useCallback((): void => {
    if (!canGrab) return;
    if (!isGrabbed) {
      onHoveredChanged({ isHovered: true })
    }
  }, [canGrab, isGrabbed])

  const onPointerOut = useCallback((): void => {
    if (!canGrab) return;
    onHoveredChanged({ isHovered: false })
  }, [canGrab])

  useLayoutEffect(() => {
    if (isShown) {
      setBoxState('SPAWNED')
    } else {
      setBoxState('NONE')
    }
    setIsGrabbed(false)
  }, [isShown])

  useEffect(() => {
    if (isExploded) {
      setBoxState('EXPLODED');
    }
  }, [isExploded])

  useFrame(() => {
    if (boxState === 'RISING') {
      const pos = rigidBodyRef.current.translation();
      if (pos.y > 1.2) setBoxState('FLOATING')
    }
    if (boxState === 'FLOATING') {
      const pos = rigidBodyRef.current.translation();
      if (pos.z >= 0.01) rigidBodyRef.current.applyImpulse(new THREE.Vector3(0, 0, -0.03), true)
      if (pos.z <= -0.01) rigidBodyRef.current.applyImpulse(new THREE.Vector3(0, 0, 0.03), true)
      if (pos.x > desiredPosX + 0.01) rigidBodyRef.current.applyImpulse(new THREE.Vector3(-0.03, 0, 0), true)
      if (pos.x < desiredPosX - 0.01) rigidBodyRef.current.applyImpulse(new THREE.Vector3(0.03, 0, 0), true)
    }
  })

  useEffect(() => {
    switch(boxState) {
      case 'SPAWNED':
        rigidBodyRef.current.resetForces(true);
        rigidBodyRef.current.setTranslation(new THREE.Vector3(0,5,0), true);
        rigidBodyRef.current.applyTorqueImpulse(new THREE.Vector3(0.01, 0.01, 0.01), true)
        break;
      case 'RISING':
        rigidBodyRef.current.setGravityScale(-1, true)
        rigidBodyRef.current.applyImpulse(new THREE.Vector3(0, 0, 0.05), true)
        break;
      case 'FLOATING':
        rigidBodyRef.current.setGravityScale(0.0, true)
        rigidBodyRef.current.setLinearDamping(10)
        rigidBodyRef.current.applyTorqueImpulse(new THREE.Vector3(0.01, 0.01, 0.01), true)
        break;
      case 'FALLING':
        rigidBodyRef.current.setGravityScale(1, true)
        rigidBodyRef.current.setLinearDamping(0)
        break;
      case 'EXPLODED':
        rigidBodyRef.current.applyImpulse(vec3(rigidBodyRef.current.translation()).addScalar(1).multiplyScalar(2), true)
        break;
      default:
        break;
    }
  }, [boxState]);

  return <>
    {isShown ? (
      <>
        <RigidBody ref={rigidBodyRef}>
          <Box
            ref={boxRef}
            userData={{ boxId }}
            position={[0, 0, 0]}
            args={[0.5, 0.5, 0.5]}
            castShadow={true}
            receiveShadow={true}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerMove={onPointerMove}
            onPointerOver={onPointerOver}
            onPointerOut={onPointerOut}
          >
            {/* @ts-ignore */}
            <animated.meshStandardMaterial
              metalness={0.75}
              roughness={0.15}
              color={isGrabbed ? 'orange' : 0x2176AE}
              transparent={true}
              opacity={opacity}
            />
          </Box>
        </RigidBody>
      </>
    ) : <></>}
  </>
}

export { GrabbableBox }