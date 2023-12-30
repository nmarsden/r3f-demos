/* eslint-disable @typescript-eslint/ban-ts-comment */

import {CarConstants} from "./carConstants.ts";
import {animated, SpringValue} from "@react-spring/three";
import {useMemo} from "react";
import * as THREE from "three";
import {RigidBody} from "@react-three/rapier";
import {Extrude} from "@react-three/drei";

const RAMP_WIDTH = CarConstants.objectWidth;
const RAMP_HEIGHT = CarConstants.objectHeight;
const RAMP_DEPTH = CarConstants.baseDepth - 4;
const RAMP_COLOR = 'black';

type RampType = 'up' | 'down' | 'flat';

const Ramp = ({ opacity, type, ...props } : { opacity: SpringValue, type: RampType } & JSX.IntrinsicElements['group']) => {
  const triangleShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(RAMP_WIDTH, 0);
    shape.lineTo(RAMP_WIDTH, RAMP_HEIGHT);
    if (type === 'flat') {
      shape.lineTo(0, RAMP_HEIGHT);
    }
    shape.lineTo(0, 0);
    return shape;
  }, []);
  const positionX = useMemo(() => {
    return type === 'up' ? 0 : RAMP_WIDTH;
  }, []);

  return (
    <group position-x={positionX} >
      <RigidBody
        type={'fixed'}
        colliders={'hull'}
        position={props.position}
        friction={CarConstants.groundFriction}
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
    </group>
  );
};

export { Ramp }