/* eslint-disable @typescript-eslint/ban-ts-comment */
import {animated} from "@react-spring/three";
import * as THREE from "three";
import {BuggyRunConstants} from "./buggyRunConstants.ts";
import {useMemo} from "react";

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
      data[ p ] = (p < depth || p > size - depth) ? minHeight : height;
      p ++;
    }
  }
  return data;
}

const TERRAIN_DEPTH = 50;
const TERRAIN_DEPTH_SEGMENTS = Math.round(TERRAIN_DEPTH * 0.125);
const TERRAIN_MAX_HEIGHT = 5;
const TERRAIN_POS_Y = (TERRAIN_DEPTH * -0.5);
const TERRAIN_POS_Z = BuggyRunConstants.baseDepth * 0.5;
const TERRAIN_COLOR = 0x400000;
const TERRAIN_OPACITY = 1;
const TERRAIN_FLAT_SHADING = true;

const Terrain = ({ levelWidth } : { levelWidth: number }) => {

  const geometry = useMemo(() => {
    const TERRAIN_WIDTH_SEGMENTS = Math.round(levelWidth * 0.125 * 0.75);
    const TERRAIN_HEIGHT_DATA = generateHeightData(TERRAIN_DEPTH_SEGMENTS, TERRAIN_WIDTH_SEGMENTS, 0, TERRAIN_MAX_HEIGHT);

    const geometry = new THREE.PlaneGeometry(levelWidth, TERRAIN_DEPTH, TERRAIN_WIDTH_SEGMENTS - 1, TERRAIN_DEPTH_SEGMENTS - 1);
    geometry.rotateX( - Math.PI / 2 );
    const vertices = geometry.attributes.position.array;
    for ( let i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3 ) {
      // j + 1 because it is the y component that we modify
      vertices[ j + 1 ] = TERRAIN_HEIGHT_DATA[ i ];
    }
    geometry.computeVertexNormals();
    return geometry;
  }, [levelWidth]);

  return (
    <>
      <mesh
        position={[levelWidth * 0.5, TERRAIN_POS_Y, TERRAIN_POS_Z]}
        rotation={[Math.PI * 0.5,0,0]}
        geometry={geometry}
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
    </>
  )
}

export { Terrain }