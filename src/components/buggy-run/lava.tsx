/* eslint-disable @typescript-eslint/ban-ts-comment */

import * as THREE from 'three'
import {CuboidCollider} from "@react-three/rapier";
import {useCallback, useMemo, useRef} from "react";
import {BuggyRunConstants} from "./buggyRunConstants.ts";
import {useFrame} from "@react-three/fiber";
import {ShaderMaterial} from "three";

const LAVA_WIDTH = BuggyRunConstants.objectWidth;
const LAVA_HEIGHT = 1;
const LAVA_DEPTH = 6;

let isHit = false;

const fragmentShader = `
uniform vec3 u_colorA;
uniform vec3 u_colorB;
varying float vZ;


void main() {
  vec3 color = mix(u_colorA, u_colorB, vZ * 2.0 + 0.5); 
  gl_FragColor = vec4(color, 1.0);
}

`;

const vertexShader = `
uniform float u_time;

varying float vZ;

void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  
  modelPosition.y += sin(modelPosition.x * 5.0 + u_time * 3.0) * 0.25;
  modelPosition.y += sin(modelPosition.z * 6.0 + u_time * 2.0) * 0.25;
  
  vZ = modelPosition.y;

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;
}

`;

const Lava = ({ onHit, ...props } : { onHit: () => void } & JSX.IntrinsicElements['group']) => {
  const mesh = useRef<THREE.Mesh>(null!);

  const uniforms = useMemo(
    () => ({
      u_time: {
        value: 0.0,
      },
      u_colorA: { value: new THREE.Color("#000000") },
      u_colorB: { value: new THREE.Color("orange").multiplyScalar(2) },
    }), []
  );

  const onIntersectionEnter = useCallback(() => {
    if (isHit) return;

    isHit = true;
    setTimeout(() => { isHit = false; }, 1000);

    onHit();
  }, [onHit]);

  useFrame((state) => {
    if (!mesh.current) return;

    const { clock } = state;
    (mesh.current.material as ShaderMaterial).uniforms.u_time.value = clock.getElapsedTime();
  });

  return (
    <group position-x={LAVA_WIDTH * 0.5} position-y={LAVA_HEIGHT}>
      <mesh ref={mesh} position={props.position} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[LAVA_WIDTH, LAVA_DEPTH, 16, 8]} />
        <shaderMaterial
          fragmentShader={fragmentShader}
          vertexShader={vertexShader}
          uniforms={uniforms}
          wireframe={false}
        />
        <CuboidCollider
          args={[LAVA_WIDTH * 0.5, LAVA_DEPTH * 0.5, LAVA_HEIGHT * 0.5]}
          sensor={true}
          onIntersectionEnter={onIntersectionEnter}
        />
      </mesh>
    </group>
  );
};

export { Lava }