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
  opacity: SpringValue,
  onHoveredChanged: (event: ButtonHoveredChangedEvent) => void,
  onButtonClicked: () => void,
  enabled: boolean
}

const PushButton = ({ opacity, onHoveredChanged, onButtonClicked, enabled }: PushButtonProps) => {
  const [{ positionY }, api] = useSpring(() => ({
    from: { positionY: 0.5 },
    config: config.stiff
  }))

  const onPointerOver = useCallback(() => {
    if (!enabled) {
      return
    }
    onHoveredChanged({ isHovered: true })
  }, [enabled])

  const onPointerOut = useCallback(() => {
    if (!enabled) {
      return
    }
    onHoveredChanged({ isHovered: false })
  }, [enabled])

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
    scale={0.25}
    position-z={1.75}
    position-y={-1.3}
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