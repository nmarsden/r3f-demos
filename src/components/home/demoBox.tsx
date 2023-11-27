/* eslint-disable @typescript-eslint/ban-ts-comment */

import {animated, SpringValue} from "@react-spring/three";
import * as THREE from "three";
import {Demo} from "../../hooks/demos.ts";
import {useCallback, useEffect, useRef, useState} from "react";
import {ThreeEvent, useFrame} from "@react-three/fiber";
import {Box, Outlines} from "@react-three/drei";
import {RapierRigidBody, RigidBody} from "@react-three/rapier";
import {useHashLocation} from "../../hooks/hashLocation.ts";

export type HoverChangedEvent = {
  isHovered: boolean;
};

type DemoBoxProps = {
  opacity: SpringValue,
  position: THREE.Vector3,
  size: number,
  risingDelayMsecs: number,
  demo: Demo,
  onHoverChanged: (event: HoverChangedEvent) => void
};

type InternalDemoBoxProps = {
  opacity: SpringValue,
  position: THREE.Vector3,
  size: number,
  demo: Demo,
  onHoverChanged: (event: HoverChangedEvent) => void
};

const InternalDemoBox = ({ opacity, position, size, demo, onHoverChanged }: InternalDemoBoxProps) => {
  const [hovered, setHovered] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, hashNavigate] = useHashLocation();

  const onPointerOver = useCallback((event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setHovered(true);
    onHoverChanged({ isHovered: true });
  }, [])

  const onPointerOut = useCallback(() => {
    setHovered(false);
    onHoverChanged({ isHovered: false });
  }, [])

  return (
    <Box
      position={position}
      args={[size, size, size]}
      castShadow={true}
      receiveShadow={true}
      onClick={() => hashNavigate(demo.path)}
      onPointerOver={(event) => onPointerOver(event)}
      onPointerOut={() => onPointerOut()}
    >
      {/* @ts-ignore */}
      <animated.meshStandardMaterial
        metalness={0.75}
        roughness={0.45}
        color={hovered ? 'orange' : 0x2176AE}
        transparent={true}
        opacity={opacity}
        map={demo.texture}
      />
      {hovered && (
        <Outlines
          thickness={0.02}
          color="orange"
          angle={Math.PI}
          screenspace={false}
          opacity={1}
          transparent={true}
        />
      )}
      {/*<Html center={true} transform={true} scale={0.4} occlude={true} position-z={DEMO_BOX_SIZE/2 + 0.01}>*/}
      {/*  <Link href={demoBox.path}>*/}
      {/*    <a>{demoBox.label.toUpperCase()}</a>*/}
      {/*  </Link>*/}
      {/*</Html>*/}
    </Box>
  )
};

type DemoBoxState = 'GROUNDED' | 'RISING' | 'FLOATING';

const DemoBox = ({ opacity, position, size, risingDelayMsecs, demo, onHoverChanged }: DemoBoxProps) => {
  const rigidBodyRef = useRef<RapierRigidBody>(null!)
  const [boxState, setBoxState] = useState<DemoBoxState>('GROUNDED');
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    if (!opacity.isAnimating) {
      setTimeout(() => {
        setBoxState('RISING')
      }, risingDelayMsecs)
    }
  }, [opacity.isAnimating])

  useEffect(() => {
    if (opacity.isAnimating) return;

    switch(boxState) {
      case 'GROUNDED':
        rigidBodyRef.current.resetForces(true);
        rigidBodyRef.current.setGravityScale(1, true);
        break;
      case 'RISING':
        rigidBodyRef.current.setGravityScale(-1, true)
        rigidBodyRef.current.applyImpulse(new THREE.Vector3(0, 0, 0.05), true)
        break;
      case 'FLOATING':
        rigidBodyRef.current.setGravityScale(0, true)
        rigidBodyRef.current.setLinearDamping(10)
        rigidBodyRef.current.applyTorqueImpulse(new THREE.Vector3(0.0, 0.01, 0.0), true)
        break;
      default:
        break;
    }
  }, [boxState, opacity.isAnimating])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  useFrame(() => {
    if (opacity.isAnimating) return;

    if (boxState === 'RISING') {
      const pos = rigidBodyRef?.current.translation();
      if (pos.y > 0.8) {
        setBoxState('FLOATING')
        setCounter(0)
      }
    }
    if (boxState === 'FLOATING') {
      setCounter(counter + 1);
      if (counter === 500) {
        rigidBodyRef.current.setLinearDamping(3)
        rigidBodyRef.current.setGravityScale(0.06, true)
      } else if (counter === 1000) {
        rigidBodyRef.current.setGravityScale(-0.06, true)
        setCounter(0)
      }
    }
  })

  return opacity.isAnimating ?
    (
      <InternalDemoBox opacity={opacity} position={position} size={size} demo={demo} onHoverChanged={onHoverChanged} />
    ) : (
      <RigidBody ref={rigidBodyRef}>
        <InternalDemoBox opacity={opacity} position={position} size={size} demo={demo} onHoverChanged={onHoverChanged} />
      </RigidBody>
    )
}

export { DemoBox }