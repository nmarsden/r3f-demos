/* eslint-disable @typescript-eslint/ban-ts-comment */

import {animated, SpringValue} from "@react-spring/three";
import {RigidBody} from "@react-three/rapier";
import {Box, Extrude} from "@react-three/drei";
import {useMemo} from "react";
import * as THREE from "three";

const BASE_HEIGHT = 20;
const BASE_DEPTH = 10;
const GROUND_LENGTH = 2000;
const GROUND_FRICTION = 2;

const BASE_POS_OFFSET_X = -20;
const BASE_POS_X = GROUND_LENGTH * 0.5 + BASE_POS_OFFSET_X;
const BASE_POS_Y = BASE_HEIGHT * -0.5;

const TERRAIN_WIDTH = GROUND_LENGTH;
const TERRAIN_DEPTH = 50;
const TERRAIN_WIDTH_SEGMENTS = Math.round(TERRAIN_WIDTH * 0.125 * 0.75);
const TERRAIN_DEPTH_SEGMENTS = Math.round(TERRAIN_DEPTH * 0.125);
const TERRAIN_MAX_HEIGHT = 20;
const TERRAIN_POS_X = BASE_POS_X;
const TERRAIN_POS_Y = -TERRAIN_MAX_HEIGHT;
const TERRAIN_POS_Z = -((TERRAIN_DEPTH * 0.5) + (BASE_DEPTH * 0.5));
const TERRAIN_POS_Z_2 = (TERRAIN_DEPTH * 0.5) + (BASE_DEPTH * 0.5);
const TERRAIN_COLOR = 0xDDDDDD;
const TERRAIN_OPACITY = 0.3;
const TERRAIN_FLAT_SHADING = true;

const NUM_MARKERS = 100;
const MARKER_SIZE = 1;
const MARKER_OFFSET = GROUND_LENGTH / NUM_MARKERS;
const MARKER_POSITIONS_X = new Array(NUM_MARKERS);
for (let i = 0; i<NUM_MARKERS; i++) {
  MARKER_POSITIONS_X[i] = (i * MARKER_OFFSET) + BASE_POS_OFFSET_X + (MARKER_SIZE * 0.5);
}

const RAMP_WIDTH = 10;
const RAMP_HEIGHT = 5;
const RAMP_DEPTH = 10;
const RAMP_COLOR = 0x2176AE;

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
    <RigidBody
      type={'fixed'}
      colliders={'hull'}
      position={props.position}
      friction={GROUND_FRICTION}
    >
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
            color={RAMP_COLOR}
            transparent={true}
            opacity={opacity}
          />
        </Extrude>
      </group>
    </RigidBody>
  );
};

function generateHeightData(width: number, depth: number, minHeight: number, maxHeight: number): Float32Array {
  const size = width * depth;
  const data = new Float32Array( size );

  const hRange = maxHeight - minHeight;
  const w2 = width / 2;
  const d2 = depth / 2;
  const phaseMult = 4;

  let p = 0;

  for ( let j = 0; j < depth; j ++ ) {
    for ( let i = 0; i < width; i ++ ) {
      const radius = Math.sqrt(
        Math.pow( ( i - w2 ) / w2, 2.0 ) +
        Math.pow( ( j - d2 ) / d2, 2.0 ) );
      const height = ( Math.sin( radius * phaseMult ) + 1 ) * 0.5 * hRange + minHeight;
      data[ p ] = height;
      p ++;
    }
  }
  return data;
}

const TERRAIN_HEIGHT_DATA = generateHeightData(TERRAIN_DEPTH_SEGMENTS, TERRAIN_WIDTH_SEGMENTS, 0, TERRAIN_MAX_HEIGHT);

const createTerrainGeometry = (): THREE.PlaneGeometry => {
  const geometry = new THREE.PlaneGeometry(TERRAIN_WIDTH, TERRAIN_DEPTH, TERRAIN_WIDTH_SEGMENTS - 1, TERRAIN_DEPTH_SEGMENTS - 1);
  geometry.rotateX( - Math.PI / 2 );
  const vertices = geometry.attributes.position.array;
  for ( let i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3 ) {
    // j + 1 because it is the y component that we modify
    vertices[ j + 1 ] = TERRAIN_HEIGHT_DATA[ i ];
  }
  geometry.computeVertexNormals();
  return geometry;
}

const TERRAIN_GEOMETRY = createTerrainGeometry();

const Ground = ({ opacity, onGroundHit }: { opacity: SpringValue, onGroundHit: () => void; }) => {
  return opacity.isAnimating ? null : (
      <>
        {/* Base */}
        <RigidBody
          type={'fixed'}
          position={[BASE_POS_X, BASE_POS_Y, 0]}
          onCollisionEnter={onGroundHit}
          friction={GROUND_FRICTION}
        >
          <Box args={[GROUND_LENGTH, BASE_HEIGHT, BASE_DEPTH]} receiveShadow={true}>
            {/* @ts-ignore */}
            <animated.meshStandardMaterial
              metalness={0.15}
              roughness={0.75}
              color={'black'}
              transparent={true}
              opacity={opacity}
            />
          </Box>
        </RigidBody>
        {/* Terrain */}
        <mesh
          position={[TERRAIN_POS_X, TERRAIN_POS_Y, TERRAIN_POS_Z]}
          geometry={TERRAIN_GEOMETRY}
          receiveShadow={true}
        >
          {/* @ts-ignore */}
          <animated.meshStandardMaterial
            metalness={0.15}
            roughness={0.75}
            color={TERRAIN_COLOR}
            flatShading={TERRAIN_FLAT_SHADING}
            transparent={true}
            opacity={TERRAIN_OPACITY}
          />
        </mesh>
        <mesh
          position={[TERRAIN_POS_X, TERRAIN_POS_Y, TERRAIN_POS_Z_2]}
          geometry={TERRAIN_GEOMETRY}
          receiveShadow={true}
        >
          {/* @ts-ignore */}
          <animated.meshStandardMaterial
            metalness={0.15}
            roughness={0.75}
            color={TERRAIN_COLOR}
            flatShading={TERRAIN_FLAT_SHADING}
            transparent={true}
            opacity={TERRAIN_OPACITY}
          />
        </mesh>
        {/* Ramps */}
        <Ramp opacity={opacity} position={[200,0,0]} type={'up'}/>
        {/*<Ramp opacity={opacity} position={[145,0,0]} type={'down'}/>*/}
        {/*<Ramp opacity={opacity} position={[400,0,0]} type={'up'}/>*/}
      </>
    )
}

export { Ground }