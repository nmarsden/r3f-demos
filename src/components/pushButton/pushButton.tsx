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

export type ButtonHoveredChangedEvent = {
  isHovered: boolean;
}
type PushButtonProps = {
  opacity: SpringValue;
  position: THREE.Vector3;
  scale: number;
  onHoveredChanged: (event: ButtonHoveredChangedEvent) => void;
  onButtonClicked: () => void;
  enabled: boolean;
}

const PushButton = ({ opacity, position, scale, onHoveredChanged, onButtonClicked, enabled }: PushButtonProps) => {
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
    api.start({
      to: [
        { positionY: 0.25 },
        { positionY: 0.5 }
      ]
    })
    onButtonClicked()
  }, [enabled, onButtonClicked])

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
    >
      <cylinderGeometry args={[2, 2, 0.5]} />
      {/* @ts-ignore */}
      <animated.meshStandardMaterial
        metalness={0.75}
        roughness={0.15}
        color={'red'}
        transparent={true}
        opacity={opacity}
      />
    </animated.mesh>
  </group>
}

export { PushButton }