/* eslint-disable @typescript-eslint/ban-ts-comment */

import {animated, SpringValue} from "@react-spring/three";
import {RigidBody} from "@react-three/rapier";
import {Box, Extrude} from "@react-three/drei";
import {useMemo} from "react";
import * as THREE from "three";

const BASE_HEIGHT = 3;
const BASE_WIDTH = 30;
const GROUND_LENGTH = 1000;

const BASE_POS_OFFSET_X = -20;
const BASE_POS_X = GROUND_LENGTH * 0.5 + BASE_POS_OFFSET_X;
const BASE_POS_Y = BASE_HEIGHT * -0.5;

const NUM_MARKERS = 100;
const MARKER_SIZE = 1;
const MARKER_OFFSET = GROUND_LENGTH / NUM_MARKERS;
const MARKER_POSITIONS_X = new Array(NUM_MARKERS);
for (let i = 0; i<NUM_MARKERS; i++) {
  MARKER_POSITIONS_X[i] = (i * MARKER_OFFSET) + BASE_POS_OFFSET_X + (MARKER_SIZE * 0.5);
}
const MARKER_POS_Y = MARKER_SIZE * 0.5;
const MARKER_POS_Z = (BASE_WIDTH * 0.5) - (MARKER_SIZE * 0.5);
const MARKER_COLOR = 'red';

const RAMP_WIDTH = 10;
const RAMP_HEIGHT = 5;
const RAMP_DEPTH = 10;

type RampType = 'up' | 'down';

const Ramp = ({ opacity, type, ...props } : { opacity: SpringValue, type: RampType } & JSX.IntrinsicElements['group']) => {
  const triangleShape = useMemo(() => {
    const triangleShape = new THREE.Shape();
    triangleShape.moveTo(0, 0);
    triangleShape.lineTo(RAMP_WIDTH, 0);
    triangleShape.lineTo(RAMP_WIDTH, RAMP_HEIGHT);
    triangleShape.lineTo(0, 0);
    return triangleShape;
  }, [])

  return (
    <RigidBody type={'fixed'} colliders={'hull'} position={props.position}>
      <group rotation-y={type === 'up' ? 0 : Math.PI}>
        <Extrude
          args={[triangleShape, { depth: RAMP_DEPTH }]}
          castShadow={true}
          receiveShadow={true}
          position-z={RAMP_DEPTH * -0.5}
        >
          {/* @ts-ignore */}
          <animated.meshStandardMaterial
            metalness={0.15}
            roughness={0.75}
            color={'grey'}
            transparent={true}
            opacity={opacity}
          />
        </Extrude>
      </group>
    </RigidBody>
  );
};

const Ground = ({ opacity, onGroundHit }: { opacity: SpringValue, onGroundHit: () => void; }) => {
  return opacity.isAnimating ? null : (
      <>
        {/* Base */}
        <RigidBody type={'fixed'} position={[BASE_POS_X, BASE_POS_Y, 0]} onCollisionEnter={onGroundHit}>
          <Box args={[GROUND_LENGTH, BASE_HEIGHT, BASE_WIDTH]} receiveShadow={true}>
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
        {/* Ramps */}
        <Ramp opacity={opacity} position={[70,0,0]} type={'up'}/>
        <Ramp opacity={opacity} position={[145,0,0]} type={'down'}/>
        <Ramp opacity={opacity} position={[210,0,0]} type={'up'}/>
        {/* Markers */}
        {MARKER_POSITIONS_X.map((posX, index) =>
          <Box key={`${index}`} args={[MARKER_SIZE, MARKER_SIZE, MARKER_SIZE]} position={[posX, MARKER_POS_Y, MARKER_POS_Z]} receiveShadow={true}>
            {/* @ts-ignore */}
            <animated.meshStandardMaterial
              metalness={0.15}
              roughness={0.75}
              color={MARKER_COLOR}
              transparent={true}
              opacity={opacity}
            />
          </Box>
        )}
      </>
    )
}

export { Ground }