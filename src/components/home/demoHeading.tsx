/* eslint-disable @typescript-eslint/ban-ts-comment */
import {animated, SpringValue} from "@react-spring/three";
import {Html, RoundedBox} from "@react-three/drei";
import './home.css';
import {ReactNode} from "react";
import * as THREE from "three";

const ANNOTATION_POSITION = new THREE.Vector3(0, 2, 0);

const Heading = ({ opacity, color, position, rotationX, height, children }: { opacity: SpringValue, color: number, position: THREE.Vector3, rotationX: number, height: number, children: ReactNode }) => {
  return (
    <RoundedBox
      position={position}
      rotation-x={rotationX}
      args={[4, height, 0.5]}
      radius={0.2}
      smoothness={4}
      bevelSegments={4}
      creaseAngle={0.4}
      castShadow={true}
      receiveShadow={true}
    >
      {/* @ts-ignore */}
      <animated.meshStandardMaterial
        metalness={0.75}
        roughness={0.45}
        color={color}
        transparent={true}
        opacity={opacity}
      />
      <Html center={true} transform={true} scale={0.5} occlude={true} position-z={0.5 * 0.5 + 0.01}>
        <div className={'demo-heading'}>
          {children}
        </div>
      </Html>
      <Html center={true} transform={true} scale={-0.5} occlude={true} position-z={-0.5 * 0.5 - 0.01} rotation-y={Math.PI} rotation-z={Math.PI}>
        <div className={'demo-heading'}>
          {children}
        </div>
      </Html>
    </RoundedBox>
  )
};

const DemoHeading = ({ opacity }: { opacity: SpringValue }) => {
  return <>
    <Heading opacity={opacity} color={0x555555} position={ANNOTATION_POSITION} rotationX={0} height={2}>
      <div>React Three Fibre</div>
      <div>DEMOS</div>
    </Heading>
  </>
}

export { DemoHeading }