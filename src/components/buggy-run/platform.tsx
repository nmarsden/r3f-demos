/* eslint-disable @typescript-eslint/ban-ts-comment */

import {animated, SpringValue, useSpring} from "@react-spring/three";
import {useEffect, useRef, useState} from "react";
import {RapierRigidBody, RigidBody, useRapier, vec3} from "@react-three/rapier";
import * as THREE from "three";
import {BuggyRunConstants} from "./buggyRunConstants.ts";
import {useFrame} from "@react-three/fiber";
import {Box} from "@react-three/drei";

const PLATFORM_WIDTH = BuggyRunConstants.objectWidth * 0.5;
const PLATFORM_HEIGHT = 2;
const PLATFORM_DEPTH = BuggyRunConstants.objectDepth;
const PLATFORM_COLOR: THREE.Color = new THREE.Color('black');
const VECTOR = new THREE.Vector3(0,0,0);

const Platform = ({ opacity, ...props } : { opacity: SpringValue } & JSX.IntrinsicElements['group']) => {
  const [{ positionX }, api] = useSpring(() => ({ positionX: 0 }));
  const platform = useRef<RapierRigidBody>(null);
  const { isPaused } = useRapier();
  const [visible, setVisible] = useState(false);
  const [startPosition, setStartPosition] = useState<THREE.Vector3>(new THREE.Vector3((props.position as number[])[0], 0, 0));

  useEffect(() => {
    const position = props.position as number[];
    const isEven = (position[0] / BuggyRunConstants.objectWidth) % 2 === 0;
    const minX = PLATFORM_WIDTH * 0.5;
    const maxX = BuggyRunConstants.objectWidth - (PLATFORM_WIDTH * 0.5);
    const from = { positionX: isEven ? minX : maxX };
    const to = { positionX: isEven ? maxX : minX };
    api.start({
      from,
      to,
      loop: { reverse: true },
      delay: 2000,
      config: {
        duration: 3000
      }
    });

    setTimeout(() => {
      const pos = props.position as number[];
      const translation = vec3(platform.current?.translation());
      const y = platform.current?.rotation().w === 1 ?
        translation.y + BuggyRunConstants.objectHeight - (PLATFORM_HEIGHT * 0.5) :
        translation.y - BuggyRunConstants.objectHeight + (PLATFORM_HEIGHT * 0.5);

      setStartPosition(new THREE.Vector3(pos[0], y, 0));

      setTimeout(() => setVisible(true), 600);
    }, 1000);
  }, [api]);

  useFrame(() => {
    if (!platform.current || startPosition.y === 0 || isPaused ) return;

    const currentPosition = vec3(platform.current.translation());
    const desiredPosition = startPosition.clone().add(VECTOR.setX(positionX.get()));
    const newPosition = currentPosition.clone().lerp(desiredPosition, 0.1);

    platform.current.setNextKinematicTranslation(newPosition);
  });

  return (
    <RigidBody
      ref={platform}
      type={'kinematicPosition'}
      position={startPosition}
      includeInvisible={true}
    >
      <Box args={[PLATFORM_WIDTH,PLATFORM_HEIGHT,PLATFORM_DEPTH]} visible={visible}>
        {/* @ts-ignore */}
        <animated.meshStandardMaterial
          metalness={0.15}
          roughness={0.75}
          color={PLATFORM_COLOR}
          transparent={true}
          opacity={opacity}
        />
      </Box>
    </RigidBody>
  );
};

export { Platform };