/* eslint-disable @typescript-eslint/ban-ts-comment */

import * as THREE from 'three'
import {CuboidCollider, RapierRigidBody, RigidBody, useRapier, vec3} from "@react-three/rapier";
import {useCallback, useEffect, useMemo, useRef} from "react";
import {BuggyRunConstants} from "./buggyRunConstants.ts";
import {useFrame} from "@react-three/fiber";
import {ShaderMaterial} from "three";
import {animated, config, SpringValue, useSpring} from "@react-spring/three";
import {Box} from "@react-three/drei";

const LAVA_WIDTH = BuggyRunConstants.objectWidth;
const LAVA_HEIGHT = 1;
const LAVA_DEPTH = 6;

let isLavaHit = false;

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

const PLATFORM_WIDTH = BuggyRunConstants.objectWidth * 0.5;
const PLATFORM_HEIGHT = 2;
const PLATFORM_DEPTH = BuggyRunConstants.baseDepth - 4;
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

const LavaFlow = ({ onHit, ...props } : { onHit: () => void } & JSX.IntrinsicElements['group']) => {
  const mesh = useRef<THREE.Mesh>(null!);

  const uniforms = useMemo(
    () => ({
      u_time: {
        value: 0.0,
      },
      u_colorA: { value: new THREE.Color("#000000") },
      u_colorB: { value: new THREE.Color("orange").multiplyScalar(0.5) },
    }), []
  );

  const onIntersectionEnter = useCallback(() => {
    if (isLavaHit) return;

    isLavaHit = true;
    setTimeout(() => { isLavaHit = false; }, 1000);

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

const Lava = ({ opacity, onHit, ...props } : { opacity: SpringValue, onHit: () => void  } & JSX.IntrinsicElements['group']) => {
  return (
    <>
      <Platform opacity={opacity} {...props} />
      <LavaFlow onHit={onHit} {...props} />
    </>
  );
};

export { Lava }