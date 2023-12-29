/* eslint-disable @typescript-eslint/ban-ts-comment */

import {animated, SpringValue} from "@react-spring/three";
import {RigidBody} from "@react-three/rapier";
import {Box} from "@react-three/drei";

const WALL_WIDTH = 3;
const WALL_HEIGHT = 6;
const WALL_DEPTH = 10;

const Wall = ({ opacity, ...props } : { opacity: SpringValue } & JSX.IntrinsicElements['group']) => {
  return (
    <group position-y={WALL_HEIGHT * 0.5}>
      <RigidBody
        type={'fixed'}
        position={props.position}
      >
        <Box args={[WALL_WIDTH,WALL_HEIGHT,WALL_DEPTH]}>
          {/* @ts-ignore */}
          <animated.meshStandardMaterial
            metalness={0.45}
            roughness={0.75}
            color={'red'}
            transparent={true}
            opacity={opacity}
          />
        </Box>
      </RigidBody>
    </group>
  );
};

export { Wall }