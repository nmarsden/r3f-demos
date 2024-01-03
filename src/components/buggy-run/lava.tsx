/* eslint-disable @typescript-eslint/ban-ts-comment */

import * as THREE from 'three'
import {CuboidCollider, RapierRigidBody, RigidBody, useRapier, vec3} from "@react-three/rapier";
import {useCallback, useEffect, useMemo, useRef} from "react";
import {BuggyRunConstants} from "./buggyRunConstants.ts";
import {extend, useFrame} from "@react-three/fiber";
import {animated, config, SpringValue, useSpring} from "@react-spring/three";
import {Box, shaderMaterial} from "@react-three/drei";

const LAVA_WIDTH = BuggyRunConstants.objectWidth;
const LAVA_HEIGHT = 4;
const LAVA_DEPTH = BuggyRunConstants.objectDepth;
const LAVA_COLOR = new THREE.Color("orange");

let isLavaHit = false;

const PLATFORM_WIDTH = BuggyRunConstants.objectWidth * 0.5;
const PLATFORM_HEIGHT = 2;
const PLATFORM_DEPTH = BuggyRunConstants.objectDepth;
const PLATFORM_COLOR: THREE.Color = new THREE.Color('black');
const VECTOR = new THREE.Vector3(0,0,0);

const Platform = ({ opacity, ...props } : { opacity: SpringValue } & JSX.IntrinsicElements['group']) => {
  const [{ positionX }, api] = useSpring(() => ({
    from: { positionX: PLATFORM_WIDTH * 0.5 },
    config: config.stiff
  }))
  const platform = useRef<RapierRigidBody>(null);
  const { isPaused } = useRapier();

  const startPosition = useMemo(() => {
    const pos = props.position as number[];
    return new THREE.Vector3(pos[0], BuggyRunConstants.objectHeight - (PLATFORM_HEIGHT * 0.5), 0);
  }, []);

  useEffect(() => {
    api.start({
      to: { positionX: BuggyRunConstants.objectWidth - (PLATFORM_WIDTH * 0.5) },
      loop: true,
      reverse: true,
      delay: 2000,
      config: {
        duration: 3000
      }
    });
  }, [api]);

  useFrame(() => {
    if (!platform.current || isPaused) return;

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
    >
      <Box args={[PLATFORM_WIDTH,PLATFORM_HEIGHT,PLATFORM_DEPTH]}>
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
      // vZ = modelPosition.y;
      
      vec4 viewPosition = viewMatrix * modelPosition;
      vec4 projectedPosition = projectionMatrix * viewPosition;
      
      gl_Position = projectedPosition;
       
      // gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      
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

      // gl_FragColor.rgba = vec4(vZ, vZ, vZ, 1.0);

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