/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as THREE from "three";
import {animated, config, SpringValue, useSpring} from "@react-spring/three";
import {useCallback, useEffect} from "react";
import {RoundedBox, useTexture} from "@react-three/drei";

export type PedalHoveredChangedEvent = {
  isHovered: boolean;
}
type PushButtonProps = {
  opacity: SpringValue;
  onHoveredChanged: (event: PedalHoveredChangedEvent) => void;
  onPedalDown: () => void;
  onPedalUp: () => void;
  enabled: boolean;
}

const POSITION_Y_MIN = 0.48;
const POSITION_Y_MAX = 0.5;

const ROTATION_X_MIN = Math.PI;
const ROTATION_X_MAX = Math.PI * 1.05;

const Pedal = ({ opacity, onHoveredChanged, onPedalDown, onPedalUp, enabled }: PushButtonProps) => {
  const textureProps = useTexture({
    map:             '/r3f-demos/car/Metal_Grill_001_COLOR.jpg',
    displacementMap: '/r3f-demos/car/Metal_Grill_001_DISP.png',
    alphaMap:        '/r3f-demos/car/Metal_Grill_001_MASK.jpg',
    normalMap:       '/r3f-demos/car/Metal_Grill_001_NORM.jpg',
    aoMap:           '/r3f-demos/car/Metal_Grill_001_OCC.jpg',
    // roughnessMap:    '/r3f-demos/car/Metal_Grill_001_ROUGH.jpg',
  })

  const [{ positionY, rotationX }, api] = useSpring(() => ({
    from: { positionY: POSITION_Y_MAX, rotationX: ROTATION_X_MIN },
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
    api.start({ to: { positionY: POSITION_Y_MIN, rotationX: ROTATION_X_MAX } })
    onPedalDown()
  }, [enabled, onPedalDown])

  const onPointerUp = useCallback(() => {
    if (!enabled) {
      return
    }
    api.start({ to: { positionY: POSITION_Y_MAX, rotationX: ROTATION_X_MIN } })
    onPedalUp()
  }, [enabled, onPedalUp])

  useEffect(() => {
    const offset = new THREE.Vector2(0.117, 0.092);
    Object.keys(textureProps).forEach(key => {
      // @ts-ignore
      (textureProps[key] as THREE.Texture).offset = offset;
      // @ts-ignore
      (textureProps[key] as THREE.Texture).repeat.set(0.8, 0.8);
    })
  }, [textureProps]);

  return <animated.group
    position-y={positionY}
    position-z={0.1}
    rotation-x={rotationX}
  >
    <RoundedBox
      args={[0.3, 0.15, 0.1]}
      radius={0.06} // Radius of the rounded corners. Default is 0.05
      smoothness={16} // The number of curve segments. Default is 4
      bevelSegments={0} // The number of bevel segments. Default is 4, setting it to 0 removes the bevel, as a result the texture is applied to the whole geometry.
      creaseAngle={0.4} // Smooth normals everywhere except faces that meet at an angle greater than the crease angle
      castShadow={true}
      receiveShadow={true}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      {/* @ts-ignore */}
      <animated.meshStandardMaterial
        attach="material-0"
        metalness={0.75}
        roughness={0.45}
        color={0xBBBBBB}
        transparent={true}
        opacity={opacity}
        {...textureProps}
        displacementScale={0.005}
      />
      <animated.meshStandardMaterial attach="material-1" metalness={0.45} roughness={0.75} color={0x111111} transparent={true} opacity={opacity} />
    </RoundedBox>
  </animated.group>
}

export { Pedal }