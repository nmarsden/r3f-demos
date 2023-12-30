/* eslint-disable @typescript-eslint/ban-ts-comment */

import * as THREE from 'three'
import {animated, SpringValue} from "@react-spring/three";
import {CuboidCollider, IntersectionEnterPayload, RapierRigidBody, RigidBody} from "@react-three/rapier";
import {Box} from "@react-three/drei";
import {forwardRef, useCallback, useImperativeHandle, useRef} from "react";

const CRATE_WIDTH = 2.5;
const CRATE_HEIGHT = 2.5;
const CRATE_DEPTH = 2.5;

const CRATE_POSITIONS: THREE.Vector3[] = [
  new THREE.Vector3(0, CRATE_HEIGHT * 0.5, CRATE_DEPTH * 1.1),
  new THREE.Vector3(0, CRATE_HEIGHT * 0.5, 0),
  new THREE.Vector3(0, CRATE_HEIGHT * 0.5, CRATE_DEPTH * -1.1),
  new THREE.Vector3(0, CRATE_HEIGHT * 1.5, CRATE_DEPTH * 0.6),
  new THREE.Vector3(0, CRATE_HEIGHT * 1.5, CRATE_DEPTH * -0.6),
  new THREE.Vector3(0, CRATE_HEIGHT * 2.5, 0)
];

type CrateRef = {
  hit: () => void;
} | null;

type CrateProps = {
  opacity: SpringValue
} & JSX.IntrinsicElements['group'];

const Crate = forwardRef<CrateRef, CrateProps>(({ opacity, ...props } : CrateProps, ref) => {
  const crate = useRef<RapierRigidBody>(null!);

  useImperativeHandle(ref, () => ({
    hit: () => {
      const position = crate.current.translation();
      crate.current.applyTorqueImpulse(new THREE.Vector3(0.01, 0.01, 0.01), true)
      crate.current.applyImpulse(new THREE.Vector3(100, position.y * 5, position.z * 5), true);
    }
  }), [crate]);

  return (
    <group position-y={CRATE_HEIGHT * 0.5}>
      <RigidBody
        ref={crate}
        type={'dynamic'}
        position={props.position}
        mass={0.000001}
      >
        <Box args={[CRATE_WIDTH,CRATE_HEIGHT,CRATE_DEPTH]}>
          {/* @ts-ignore */}
          <animated.meshStandardMaterial
            metalness={0.45}
            roughness={0.75}
            color={'white'}
            transparent={true}
            opacity={opacity}
          />
        </Box>
      </RigidBody>
    </group>
  );
});

const Crates = ({ opacity, ...props } : { opacity: SpringValue } & JSX.IntrinsicElements['group']) => {
  const crates = useRef<CrateRef[]>([]);

  const onIntersectionEnter = useCallback((payload: IntersectionEnterPayload) => {
    if (!payload.other.colliderObject?.name.startsWith('jeep')) return;

    crates.current.forEach((crate, index) => {
      if (index === 5) return; // do not hit the top crate
      crate?.hit()
    })
  }, [crates]);

  return (
    <group position={props.position}>
      <CuboidCollider
        args={[0.05, CRATE_HEIGHT * 1.5, 5]}
        position={[(CRATE_WIDTH * -0.5) - 0.05, CRATE_HEIGHT * 1.5 , 0]}
        sensor={true}
        onIntersectionEnter={onIntersectionEnter}
      />
      <>
        {CRATE_POSITIONS.map((position, index) => {
          const key = `${index}`;
          return (
            <Crate
              key={key}
              ref={(ref) => crates.current[index] = ref}
              opacity={opacity}
              position={position}
            />
          );
        })}
      </>
    </group>
  );
};

export { Crates }