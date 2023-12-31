/* eslint-disable @typescript-eslint/ban-ts-comment */

import {animated, SpringValue} from "@react-spring/three";
import {RigidBody} from "@react-three/rapier";
import {Box} from "@react-three/drei";
import {useCallback} from "react";

const WALL_WIDTH = 3;
const WALL_HEIGHT = 3;
const WALL_DEPTH = 10;

let isHit = false;

const Wall = ({ opacity, onHit, ...props } : { opacity: SpringValue, onHit: () => void } & JSX.IntrinsicElements['group']) => {
  const onCollisionEnter = useCallback(() => {
    if (isHit) return;

    isHit = true;
    setTimeout(() => { isHit = false; }, 1000);

    onHit();
  }, [onHit]);

  return (
    <group position-y={WALL_HEIGHT * 0.5}>
      <RigidBody
        type={'fixed'}
        position={props.position}
        onCollisionEnter={onCollisionEnter}
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