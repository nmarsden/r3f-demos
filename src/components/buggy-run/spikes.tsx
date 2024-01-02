/* eslint-disable @typescript-eslint/ban-ts-comment */

import * as THREE from "three";
import {animated, SpringValue} from "@react-spring/three";
import {useCallback, useMemo} from "react";
import {RigidBody} from "@react-three/rapier";
import {Box, Extrude} from "@react-three/drei";
import {BuggyRunConstants} from "./buggyRunConstants.ts";

const NUM_SPIKES = 8;
const SPIKES_WIDTH = BuggyRunConstants.objectWidth;
const SPIKES_HEIGHT = 2;
const SPIKES_DEPTH = BuggyRunConstants.baseDepth - 4;
const SPIKE_WIDTH = SPIKES_WIDTH / NUM_SPIKES;
const SPIKES_COLOR = new THREE.Color('orange').multiplyScalar(2);

const WALL_WIDTH = BuggyRunConstants.objectWidth;
const WALL_HEIGHT = BuggyRunConstants.objectHeight - SPIKES_HEIGHT;
const WALL_DEPTH = BuggyRunConstants.baseDepth - 4;
const WALL_COLOR: THREE.Color = new THREE.Color('black');

let isHit = false;

const Spikes = ({ opacity, onHit, ...props } : { opacity: SpringValue, onHit: () => void } & JSX.IntrinsicElements['group']) => {
  const triangleShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    for (let i=0; i<NUM_SPIKES; i++) {
      shape.lineTo((i * SPIKE_WIDTH) + SPIKE_WIDTH * 0.5, SPIKES_HEIGHT);
      shape.lineTo((i * SPIKE_WIDTH) + SPIKE_WIDTH, 0);
    }
    shape.lineTo(0, 0);
    return shape;
  }, []);

  const positionX = useMemo(() => {
    return SPIKES_WIDTH;
  }, []);

  const onCollisionEnter = useCallback(() => {
    if (isHit) return;

    isHit = true;
    setTimeout(() => { isHit = false; }, 1000);

    onHit();
  }, [onHit]);

  return (
    <group position-x={positionX} >
      <RigidBody
        type={'fixed'}
        colliders={'trimesh'}
        position={props.position}
        onCollisionEnter={onCollisionEnter}
      >
        <Box
          args={[WALL_WIDTH,WALL_HEIGHT,WALL_DEPTH]}
          position-x={WALL_WIDTH * -0.5}
          position-y={WALL_HEIGHT * 0.5}
        >
          {/* @ts-ignore */}
          <animated.meshStandardMaterial
            metalness={0.15}
            roughness={0.75}
            color={WALL_COLOR}
            transparent={true}
            opacity={opacity}
          />
        </Box>
        <group rotation-y={Math.PI}>
          <Extrude
            args={[triangleShape, { depth: SPIKES_DEPTH, bevelEnabled: false }]}
            castShadow={true}
            receiveShadow={true}
            position-y={WALL_HEIGHT}
            position-z={SPIKES_DEPTH * -0.5}
          >
            {/* @ts-ignore */}
            <animated.meshStandardMaterial
              metalness={0.15}
              roughness={0.75}
              color={SPIKES_COLOR}
              transparent={true}
              opacity={opacity}
            />
          </Extrude>
        </group>
      </RigidBody>
    </group>
  );
};

export { Spikes }