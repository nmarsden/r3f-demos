/* eslint-disable @typescript-eslint/ban-ts-comment */

import * as THREE from 'three'
import {config, SpringValue, useSpring} from "@react-spring/three";
import {RapierRigidBody, RigidBody, useRapier, vec3} from "@react-three/rapier";
import {Box} from "@react-three/drei";
import {useCallback, useEffect, useMemo, useRef} from "react";
import {BuggyRunConstants} from "./buggyRunConstants.ts";
import {useFrame} from "@react-three/fiber";

const WALL_WIDTH = 3;
const WALL_HEIGHT = BuggyRunConstants.objectHeight;
const WALL_DEPTH = 10;
const WALL_COLOR: THREE.Color = new THREE.Color('orange').multiplyScalar(2);

const vertexShader = `
    varying vec2 vUv;
    void main()	{
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
`;
const fragmentShader = `
    varying vec2 vUv;
    uniform vec3 u_color;
    uniform float u_thickness;
   	
    float edgeFactor(vec2 p){
    	vec2 grid = abs(fract(p - 0.5) - 0.5) / fwidth(p) / u_thickness;
  		return min(grid.x, grid.y);
    }
    
    void main() {
      float a = edgeFactor(vUv);

      vec3 c = vec3(a) * u_color;      
      
      gl_FragColor = vec4(c, 1.0);
    }
`;

let isHit = false;

const Wall = ({ opacity, onHit, ...props } : { opacity: SpringValue, onHit: () => void } & JSX.IntrinsicElements['group']) => {
  const [{ positionY }, api] = useSpring(() => ({
    from: { positionY: WALL_HEIGHT * 0.5 },
    config: config.stiff
  }))
  const wall = useRef<RapierRigidBody>(null);
  const { isPaused } = useRapier();

  const uniforms = useMemo(() => {
    return {
      u_thickness: { value: 2 },
      u_color: { value: WALL_COLOR }
    };
  }, []);

  const onCollisionEnter = useCallback(() => {
    if (isHit) return;

    isHit = true;
    setTimeout(() => { isHit = false; }, 1000);

    onHit();
  }, [onHit]);

  useEffect(() => {
    api.start({
      to: { positionY: (WALL_HEIGHT * -0.5) - 0.05 },
      loop: true,
      reverse: true,
      delay: 2000,
      config: {
        duration: 3000
      }
    });
  }, [api]);

  useFrame(() => {
    if (!wall.current || isHit || isPaused) return;

    const currentPosition = vec3(wall.current.translation());
    const desiredPosition = currentPosition.clone().setY(positionY.get())

    const newPosition = currentPosition.clone().lerp(desiredPosition, 0.1);

    wall.current.setNextKinematicTranslation(newPosition);
  });

  return (
    <RigidBody
      ref={wall}
      type={'kinematicPosition'}
      position={props.position}
      onCollisionEnter={onCollisionEnter}
    >
      <Box args={[WALL_WIDTH,WALL_HEIGHT,WALL_DEPTH]}>
        <shaderMaterial
          fragmentShader={fragmentShader}
          vertexShader={vertexShader}
          uniforms={uniforms}
        />
      </Box>
    </RigidBody>
  );
};

export { Wall }