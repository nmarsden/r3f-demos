/* eslint-disable @typescript-eslint/ban-ts-comment */
import {animated, config, SpringValue, useSpring} from "@react-spring/three";
import {useCallback, useMemo} from "react";
import * as THREE from "three";
import {Lathe} from "@react-three/drei";

const ButtonBase = ({ opacity }: { opacity: SpringValue }) => {
  const triangleShape = useMemo(() => {
    const triangleShape = new THREE.Shape();
    triangleShape.moveTo(2, 0.5);
    triangleShape.lineTo(2, 0);
    triangleShape.lineTo(2.5, 0);
    triangleShape.lineTo(2, 0.5);
    return triangleShape;
  }, [])

  return (
    <Lathe
      args={[triangleShape.getPoints(), 32]}
      castShadow={true}
      receiveShadow={true}
    >
      {/* @ts-ignore */}
      <animated.meshStandardMaterial
        metalness={0.15}
        roughness={0.75}
        color={'grey'}
        transparent={true}
        opacity={opacity}
      />
    </Lathe>
  )
}

export type PedalHoveredChangedEvent = {
  isHovered: boolean;
}
type PushButtonProps = {
  opacity: SpringValue;
  position: THREE.Vector3;
  scale: number;
  onHoveredChanged: (event: PedalHoveredChangedEvent) => void;
  onPedalDown: () => void;
  onPedalUp: () => void;
  enabled: boolean;
}

const Pedal = ({ opacity, position, scale, onHoveredChanged, onPedalDown, onPedalUp, enabled }: PushButtonProps) => {
  const [{ positionY }, api] = useSpring(() => ({
    from: { positionY: 0.5 },
    config: config.stiff
  }))

  const onPointerOver = useCallback(() => {
    if (!enabled) {
      return
    }
    onHoveredChanged({ isHovered: true })
  }, [enabled, onHoveredChanged])

  const onPointerOut = useCallback(() => {
    if (!enabled) {
      return
    }
    onHoveredChanged({ isHovered: false })
  }, [enabled, onHoveredChanged])

  const onPointerDown = useCallback(() => {
    if (!enabled) {
      return
    }
    api.start({ to: { positionY: 0.25 } })
    onPedalDown()
  }, [enabled, onPedalDown])

  const onPointerUp = useCallback(() => {
    if (!enabled) {
      return
    }
    api.start({ to: { positionY: 0.5 } })
    onPedalUp()
  }, [enabled, onPedalUp])

  return <group
    scale={scale}
    position={position}
  >
    <ButtonBase opacity={opacity} />
    <animated.mesh
      position-y={positionY}
      castShadow={true}
      receiveShadow={true}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      <cylinderGeometry args={[2, 2, 0.5]} />
      {/* @ts-ignore */}
      <animated.meshStandardMaterial
        metalness={0.75}
        roughness={0.15}
        color={'blue'}
        transparent={true}
        opacity={opacity}
      />
    </animated.mesh>
  </group>
}

export { Pedal }