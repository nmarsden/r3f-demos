/* eslint-disable @typescript-eslint/ban-ts-comment */

import {animated, SpringValue} from "@react-spring/three";
import {RigidBody} from "@react-three/rapier";
import {Box} from "@react-three/drei";

const Ground = ({ opacity }: { opacity: SpringValue }) => {
  return opacity.isAnimating ? null : (
      <>
        <RigidBody type={'fixed'} position={[480, -1.5, 0]}>
          <Box args={[1000, 3, 30]} receiveShadow={true}>
            {/* @ts-ignore */}
            <animated.meshStandardMaterial
              metalness={0.15}
              roughness={0.75}
              color={0x2176AE}
              transparent={true}
              opacity={opacity}
            />
          </Box>
        </RigidBody>
      </>
    )
}

export { Ground }