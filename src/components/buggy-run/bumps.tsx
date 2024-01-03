/* eslint-disable @typescript-eslint/ban-ts-comment */

import * as THREE from "three";
import {BuggyRunConstants} from "./buggyRunConstants.ts";
import {animated, SpringValue} from "@react-spring/three";
import {useMemo} from "react";
import {RigidBody} from "@react-three/rapier";
import {Extrude} from "@react-three/drei";

const NUM_BUMPS = 8;
const BUMPS_WIDTH = BuggyRunConstants.objectWidth;
const BUMPS_HEIGHT = 2;
const BUMPS_DEPTH = BuggyRunConstants.objectDepth;
const BUMPS_COLOR = 'black';
const BUMP_WIDTH = BUMPS_WIDTH / NUM_BUMPS;

const Bumps = ({ opacity, ...props } : { opacity: SpringValue } & JSX.IntrinsicElements['group']) => {
  const triangleShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    for (let i=0; i<NUM_BUMPS; i++) {
      shape.lineTo((i * BUMP_WIDTH) + BUMP_WIDTH * 0.5, BUMPS_HEIGHT);
      shape.lineTo((i * BUMP_WIDTH) + BUMP_WIDTH, 0);
    }
    shape.lineTo(0, 0);
    return shape;
  }, []);
  const positionX = useMemo(() => {
    return BUMPS_WIDTH;
  }, []);

  return (
    <group position-x={positionX} >
      <RigidBody
        type={'fixed'}
        colliders={'trimesh'}
        position={props.position}
        friction={BuggyRunConstants.groundFriction}
      >
        <group rotation-y={Math.PI}>
          <Extrude
            args={[triangleShape, { depth: BUMPS_DEPTH, bevelEnabled: false }]}
            castShadow={true}
            receiveShadow={true}
            position-z={BUMPS_DEPTH * -0.5}
          >
            {/* @ts-ignore */}
            <animated.meshStandardMaterial
              metalness={0.15}
              roughness={0.75}
              color={BUMPS_COLOR}
              transparent={true}
              opacity={opacity}
            />
          </Extrude>
        </group>
      </RigidBody>
    </group>
  );
};

export { Bumps }