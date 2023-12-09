/* eslint-disable @typescript-eslint/ban-ts-comment */
import {Box} from "@react-three/drei";
import {useFrame} from "@react-three/fiber";
import {useEffect, useRef} from "react";
import * as THREE from "three";
import {animated, config, SpringValue, useSpring} from "@react-spring/three";

const COLOR_1 = 0xffffff;
const COLOR_2 = 0xFFA500;
const NUM_RIBBONS = 8;
const RIBBON_DEPTH = 0.01;
const RIBBON_ANGLE_DIFF = Math.PI / NUM_RIBBONS;

type RibbonProps = {
  positionY: number;
  rotationY: number;
  color: number;
}
const RIBBONS: RibbonProps[] = [];
for (let i = 0; i<NUM_RIBBONS; i++) {
  RIBBONS.push({
    positionY: -0.5 + (i * RIBBON_DEPTH),
    rotationY: i * RIBBON_ANGLE_DIFF,
    color: (i % 2) ? COLOR_1 : COLOR_2
  })
}

const Ribbon = ({ positionY, rotationY, color, opacity } : RibbonProps & { opacity: SpringValue }) => {
  return (
    <Box
      position={[0,positionY,0]}
      args={[0.125, RIBBON_DEPTH, 40]}
      rotation-y={rotationY}
    >
      { /* @ts-ignore */ }
      <animated.meshStandardMaterial
        metalness={0.45}
        roughness={0.75}
        color={color}
        transparent={true}
        opacity={opacity}
      />
    </Box>
  )
};

const TrophyBackground = () => {
  const group = useRef<THREE.Group>(null!);
  const [{ opacity, positionZ }, api] = useSpring(() => ({
    from: { positionZ: -2.55, opacity: 0 },
    config: config.molasses,
  }))

  useEffect(() => {
    api.start({
      to: { positionZ: 0, opacity: 1}
    })
  }, [])

  useFrame(() => {
    group.current.rotation.y = group.current.rotation.y + 0.01;
  })

  return (
    <animated.group ref={group} position-z={positionZ} rotation-x={Math.PI}>
      {RIBBONS.map((ribbon, index) => <Ribbon key={`${index}`} {...ribbon} opacity={opacity} />)}
    </animated.group>
  )
}

export { TrophyBackground }