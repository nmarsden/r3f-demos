/* eslint-disable @typescript-eslint/ban-ts-comment */

import * as THREE from 'three'
import {CuboidCollider} from "@react-three/rapier";
import {useCallback, useRef} from "react";
import {BuggyRunConstants} from "./buggyRunConstants.ts";
import {extend, useFrame} from "@react-three/fiber";
import {SpringValue} from "@react-spring/three";
import {shaderMaterial} from "@react-three/drei";
import {Platform} from "./platform.tsx";

const LAVA_WIDTH = BuggyRunConstants.objectWidth;
const LAVA_HEIGHT = 4;
const LAVA_DEPTH = BuggyRunConstants.objectDepth;
const LAVA_COLOR = new THREE.Color("orange");

let isLavaHit = false;

const WaveShaderMaterial = shaderMaterial(
  { time: 0, color: new THREE.Color("black") },
  // vertex shader
  /*glsl*/`
    uniform float time;

    #include <common>
    #include <logdepthbuf_pars_vertex>
  
    varying vec2 vUv;
    varying float vZ;

    void main() {
      vUv = uv;
      vec4 modelPosition = modelMatrix * vec4(position, 1.0);
      
      modelPosition.y += sin(modelPosition.x * 5.0 + time * 3.0) * 0.25;
      modelPosition.y += sin(modelPosition.z * 6.0 + time * 2.0) * 0.25;
      
      vZ = position.y;
      
      vec4 viewPosition = viewMatrix * modelPosition;
      vec4 projectedPosition = projectionMatrix * viewPosition;
      
      gl_Position = projectedPosition;
      
      #include <logdepthbuf_vertex>
    }
  `,
  // fragment shader
  /*glsl*/`
    uniform float time;
    uniform vec3 color;
    
    #include <common>
    #include <logdepthbuf_pars_fragment>
    
    varying vec2 vUv;
    varying float vZ;
    
    void main() {
    
      #include <logdepthbuf_fragment>

      gl_FragColor.rgba = vec4(vZ * color, 1.0);
    }
  `
);

extend({ WaveShaderMaterial });

const LavaFlow = ({ onHit, ...props } : { onHit: () => void } & JSX.IntrinsicElements['group']) => {
  const wave = useRef<typeof WaveShaderMaterial>(null!);
  const mesh = useRef<THREE.Mesh>(null!);

  const onIntersectionEnter = useCallback(() => {
    if (isLavaHit) return;

    isLavaHit = true;
    setTimeout(() => { isLavaHit = false; }, 1000);

    onHit();
  }, [onHit]);

  useFrame((state) => {
    if (!mesh.current) return;

    const { clock } = state;
    // @ts-ignore
    wave.current.uniforms.time.value = clock.getElapsedTime();
  });

  return (
    <group position-x={LAVA_WIDTH * 0.5} position-y={LAVA_HEIGHT * -0.2}>
      <mesh ref={mesh} position={props.position} rotation={[0, 0, 0]}>
        <boxGeometry args={[LAVA_WIDTH, LAVA_HEIGHT, LAVA_DEPTH, 16, 1, 2]} />
        {/* @ts-ignore */}
        <waveShaderMaterial ref={wave} key={WaveShaderMaterial.key} color={LAVA_COLOR} />
        <CuboidCollider
          args={[LAVA_WIDTH * 0.5, LAVA_HEIGHT * 0.5, LAVA_DEPTH * 0.5]}
          sensor={true}
          onIntersectionEnter={onIntersectionEnter}
        />
      </mesh>
    </group>
  );
};

const Lava = ({ opacity, onHit, ...props } : { opacity: SpringValue, onHit: () => void  } & JSX.IntrinsicElements['group']) => {
  return (
    <>
      <Platform opacity={opacity} {...props} />
      <LavaFlow onHit={onHit} {...props} />
    </>
  );
};

export { Lava }