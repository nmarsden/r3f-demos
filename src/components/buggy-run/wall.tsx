/* eslint-disable @typescript-eslint/ban-ts-comment */

import * as THREE from 'three'
import {animated, config, SpringValue, useSpring} from "@react-spring/three";
import {RapierRigidBody, RigidBody, useRapier, vec3} from "@react-three/rapier";
import {Box} from "@react-three/drei";
import {useCallback, useEffect, useRef} from "react";
import {BuggyRunConstants} from "./buggyRunConstants.ts";
import {useFrame} from "@react-three/fiber";

const WALL_WIDTH = 3;
const WALL_HEIGHT = BuggyRunConstants.objectHeight;
const WALL_DEPTH = 10;
const WALL_COLOR: THREE.Color = new THREE.Color(0xFF0000).multiplyScalar(2);

let isHit = false;

const Wall = ({ opacity, onHit, ...props } : { opacity: SpringValue, onHit: () => void } & JSX.IntrinsicElements['group']) => {
  const [{ positionY }, api] = useSpring(() => ({
    from: { positionY: WALL_HEIGHT * 0.5 },
    config: config.stiff
  }))
  const wall = useRef<RapierRigidBody>(null);
  const { isPaused } = useRapier();

  const onCollisionEnter = useCallback(() => {
    if (isHit) return;

    isHit = true;
    setTimeout(() => { isHit = false; }, 1000);

    onHit();
  }, [onHit]);

  useEffect(() => {
    api.start({
      to: { positionY: (WALL_HEIGHT * -0.5) - 0.05 },
      loop: true,
      reverse: true,
      delay: 2000,
      config: {
        duration: 3000
      }
    });
  }, [api]);

  useFrame(() => {
    if (!wall.current || isHit || isPaused) return;

    const currentPosition = vec3(wall.current.translation());
    const desiredPosition = currentPosition.clone().setY(positionY.get())

    const newPosition = currentPosition.clone().lerp(desiredPosition, 0.1);

    wall.current.setNextKinematicTranslation(newPosition);
  });

  return (
    <RigidBody
      ref={wall}
      type={'kinematicPosition'}
      position={props.position}
      onCollisionEnter={onCollisionEnter}
    >
      <Box args={[WALL_WIDTH,WALL_HEIGHT,WALL_DEPTH]}>
        {/* @ts-ignore */}
        <animated.meshStandardMaterial
          metalness={0.45}
          roughness={0.75}
          color={WALL_COLOR}
          transparent={true}
          opacity={opacity}
        />
      </Box>
    </RigidBody>
  );
};

export { Wall }