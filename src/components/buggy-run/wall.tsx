/* eslint-disable @typescript-eslint/ban-ts-comment */

import * as THREE from 'three'
import {animated, SpringValue, useSpring} from "@react-spring/three";
import {RapierRigidBody, RigidBody, useRapier, vec3} from "@react-three/rapier";
import {Box} from "@react-three/drei";
import {useCallback, useEffect, useMemo, useRef} from "react";
import {BuggyRunConstants} from "./buggyRunConstants.ts";
import {useFrame} from "@react-three/fiber";

const WALL_WIDTH = 3;
const WALL_HEIGHT = BuggyRunConstants.objectHeight;
const WALL_DEPTH = BuggyRunConstants.baseDepth - 4;
const WALL_COLOR: THREE.Color = new THREE.Color('orange').multiplyScalar(2);

let isHit = false;

const Wall = ({ opacity, onHit, ...props } : { opacity: SpringValue, onHit: () => void } & JSX.IntrinsicElements['group']) => {
  const [{ positionY }, api] = useSpring(() => ({ positionY: 0 }));
  const wall = useRef<RapierRigidBody>(null);
  const { isPaused } = useRapier();
  const startPosition = useMemo(() => new THREE.Vector3(0,0,0), []);

  const onCollisionEnter = useCallback(() => {
    if (isHit) return;

    isHit = true;
    setTimeout(() => { isHit = false; }, 1000);

    onHit();
  }, [onHit]);

  useEffect(() => {
    if (wall.current) {
      startPosition.copy(vec3(wall.current.translation()));
      const from = { positionY: startPosition.y - (WALL_HEIGHT * 0.5) };
      const to = { positionY: startPosition.y + (WALL_HEIGHT * 0.5) }
      if (startPosition.y >= 20) {
        to.positionY += 0.2;
      } else {
        from.positionY -= 0.2;
      }
      api.start({
        from,
        to,
        loop: { reverse: true },
        delay: 2000,
        config: {
          duration: 3000
        }
      });
    }
  }, [api, wall]);

  useFrame(() => {
    if (!wall.current || isHit || isPaused) return;

    const currentPosition = vec3(wall.current.translation());
    const desiredPosition = currentPosition.clone().setY(positionY.get());
    const newPosition = currentPosition.clone().lerp(desiredPosition, 0.1);

    wall.current.setNextKinematicTranslation(newPosition);
  });

  return (
    <group position-x={BuggyRunConstants.objectWidth * 0.5} >
      <RigidBody
        ref={wall}
        type={'kinematicPosition'}
        position={props.position}
        onCollisionEnter={onCollisionEnter}
      >
        <Box args={[WALL_WIDTH,WALL_HEIGHT,WALL_DEPTH]}>
          {/* @ts-ignore */}
          <animated.meshStandardMaterial
            metalness={0.15}
            roughness={0.75}
            color={WALL_COLOR}
            transparent={true}
            opacity={opacity}
          />
        </Box>
      </RigidBody>
    </group>
  );
};

export { Wall }