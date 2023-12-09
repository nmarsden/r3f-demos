/* eslint-disable @typescript-eslint/ban-ts-comment */
import {Circle} from "@react-three/drei";
import {useFrame} from "@react-three/fiber";
import {useEffect, useRef} from "react";
import * as THREE from "three";
import {animated, config, SpringValue, useSpring} from "@react-spring/three";

const COLOR_1 = 0xffffff;
const COLOR_2 = 0xFFA500;
const NUM_RIBBONS = 16;
const RIBBON_ANGLE_DIFF = Math.PI * 2 / NUM_RIBBONS;

type RibbonProps = {
  startAngle: number;
  color: number;
}
const RIBBONS: RibbonProps[] = [];
for (let i = 0; i<NUM_RIBBONS; i++) {
  RIBBONS.push({
    startAngle: i * RIBBON_ANGLE_DIFF,
    color: (i % 2) ? COLOR_1 : COLOR_2
  })
}

const Ribbon = ({ startAngle, color, opacity } : RibbonProps & { opacity: SpringValue }) => {
  return (
    <Circle
      args={[25, 3, startAngle, RIBBON_ANGLE_DIFF]}
    >
      { /* @ts-ignore */ }
      <animated.meshStandardMaterial
        metalness={0.45}
        roughness={0.75}
        color={color}
        transparent={true}
        opacity={opacity}
      />
    </Circle>
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
      to: { positionZ: 0, opacity: 0.5}
    })
  }, [])

  useFrame(() => {
    group.current.rotation.z = group.current.rotation.z + 0.01;
  })

  return (
    <animated.group ref={group} position-y={0.5} position-z={positionZ} rotation-x={Math.PI * -0.5}>
      {RIBBONS.map((ribbon, index) => <Ribbon key={`${index}`} {...ribbon} opacity={opacity} />)}
    </animated.group>
  )
}

export { TrophyBackground }