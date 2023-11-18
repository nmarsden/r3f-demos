/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as THREE from "three";
import {animated, SpringValue} from "@react-spring/three";
import {useCallback, useContext, useEffect, useRef, useState} from "react";
import {RapierRigidBody, RigidBody} from "@react-three/rapier";
import {ThreeEvent, useFrame} from "@react-three/fiber";
import {Box} from "@react-three/drei";
import {OrbitControlsContext} from "../../context";

const vector = new THREE.Vector3()
const grabbedIntersectPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)

type BoxState = 'NONE' | 'SPAWNED' | 'RISING' | 'FLOATING' | 'FALLING';

export type GrabbedChangeEvent = {
  isGrabbed: boolean;
}

const GrabbableBox = ({ opacity, isShown, onGrabbedChanged }: { opacity: SpringValue, isShown: boolean, onGrabbedChanged: (event: GrabbedChangeEvent) => void }) => {
  const controlsContext = useContext(OrbitControlsContext)
  const rigidBodyRef = useRef<RapierRigidBody>(null!);
  const boxRef = useRef<THREE.Mesh>(null!);
  const [isGrabbed, setIsGrabbed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [boxState, setBoxState] = useState<BoxState>('NONE');
  const [desiredPosX, setDesiredPosX] = useState<number>(0);

  const onPointerDown = useCallback((event: ThreeEvent<PointerEvent>): void => {
    if (controlsContext.controls !== null && controlsContext.controls?.current !== null) {
      controlsContext.controls.current.enabled = false;
    }
    setIsGrabbed(true)
    setBoxState('RISING')
    setIsHovered(false)
    // @ts-ignore
    event.target.setPointerCapture(event.pointerId)
    onGrabbedChanged({ isGrabbed: true })

  }, [isGrabbed])

  const onPointerUp = useCallback((event: ThreeEvent<PointerEvent>): void => {
    if (controlsContext.controls !== null && controlsContext.controls?.current !== null) {
      controlsContext.controls.current.enabled = true;
    }
    setIsGrabbed(false)
    setBoxState('FALLING')
    // @ts-ignore
    event.target.releasePointerCapture(event.pointerId)
    onGrabbedChanged({ isGrabbed: false })

  }, [isGrabbed])

  const onPointerMove = useCallback((event: ThreeEvent<PointerEvent>): void => {
    if (isGrabbed && event.ray.intersectPlane(grabbedIntersectPlane, vector)) {
      vector.clampScalar(-4, 4);
      setDesiredPosX(vector.x);
    }
  }, [isGrabbed])

  const onPointerOver = useCallback((): void => {
    if (!isGrabbed) {
      setIsHovered(true)
    }
  }, [isGrabbed])

  const onPointerOut = useCallback((): void => {
    setIsHovered(false)
  }, [])

  useEffect(() => {
    document.body.style.cursor = isHovered ? 'pointer' : isGrabbed ? 'grab' : 'auto'
    return () => {
      document.body.style.cursor = 'auto';
    }
  }, [isHovered, isGrabbed])

  useEffect(() => {
    if (isShown) {
      setBoxState('SPAWNED')
    } else {
      setBoxState('NONE')
    }
    setIsGrabbed(false)
    setIsHovered(false)
  }, [isShown])

  useFrame(() => {
    if (boxState === 'RISING') {
      const pos = rigidBodyRef.current.translation();
      if (pos.y > 1.2) setBoxState('FLOATING')
    }
    if (boxState === 'FLOATING') {
      const pos = rigidBodyRef.current.translation();
      if (pos.z >= 0.26) rigidBodyRef.current.applyImpulse(new THREE.Vector3(0, 0, -0.03), true)
      if (pos.z <= 0.24) rigidBodyRef.current.applyImpulse(new THREE.Vector3(0, 0, 0.03), true)
      if (pos.x > desiredPosX + 0.01) rigidBodyRef.current.applyImpulse(new THREE.Vector3(-0.03, 0, 0), true)
      if (pos.x < desiredPosX - 0.01) rigidBodyRef.current.applyImpulse(new THREE.Vector3(0.03, 0, 0), true)
    }
  })

  useEffect(() => {
    switch(boxState) {
      case 'SPAWNED':
        rigidBodyRef.current.setTranslation(new THREE.Vector3(0,5,0.25), true);
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
              color={isGrabbed ? 'orange' : 'white'}
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