/* eslint-disable @typescript-eslint/ban-ts-comment */

import * as THREE from 'three'
import {animated, SpringValue} from "@react-spring/three";
import {Box, useTexture} from "@react-three/drei";
import {useCallback, useEffect, useMemo} from "react";
import {BuggyRunConstants} from "./buggyRunConstants.ts";
import {CuboidCollider} from "@react-three/rapier";

const BANNER_WIDTH = 2;
const BANNER_HEIGHT = 6;
const BANNER_DEPTH = BuggyRunConstants.baseDepth;
const BANNER_COLOR: THREE.Color = new THREE.Color('black');

type PoleType = 'LEFT' | 'RIGHT';

const POLE_WIDTH = 2;
const POLE_HEIGHT = (BuggyRunConstants.objectHeight * 2) - (BANNER_HEIGHT * 0.5);
const POLE_DEPTH = 2;
const POLE_COLOR: THREE.Color = new THREE.Color('black');

let isHit = false;

const Banner = ({ opacity, ...props } : { opacity: SpringValue } & JSX.IntrinsicElements['group']) => {
  const texture = useTexture('/r3f-demos/buggy-run/checker.png')

  useEffect(() => {
    // texture.offset = new THREE.Vector2(0.117, 0.092);
    texture.repeat.set(BANNER_DEPTH * 0.25, BANNER_HEIGHT * 0.25);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.needsUpdate = true;
    // texture.repeat.set(0.8, 0.8);
  }, [texture]);

  return (
    <group position-y={BuggyRunConstants.objectHeight * 2} >
      <Box args={[BANNER_WIDTH,BANNER_HEIGHT,BANNER_DEPTH]} position={props.position} castShadow={true} receiveShadow={true}>
        {/* @ts-ignore */}
        <animated.meshStandardMaterial attach="material-0" map={texture} metalness={0.15} roughness={0.75} transparent={true} opacity={opacity} />
        <animated.meshStandardMaterial attach="material-1" map={texture} metalness={0.15} roughness={0.75} transparent={true} opacity={opacity} />
        <animated.meshStandardMaterial attach="material-2" metalness={0.15} roughness={0.75} color={BANNER_COLOR} transparent={true} opacity={opacity} />
        <animated.meshStandardMaterial attach="material-3" metalness={0.15} roughness={0.75} color={BANNER_COLOR} transparent={true} opacity={opacity} />
        <animated.meshStandardMaterial attach="material-4" metalness={0.15} roughness={0.75} color={BANNER_COLOR} transparent={true} opacity={opacity} />
        <animated.meshStandardMaterial attach="material-5" metalness={0.15} roughness={0.75} color={BANNER_COLOR} transparent={true} opacity={opacity} />
      </Box>
    </group>
  );
};

const Pole = ({ opacity, type, ...props } : { opacity: SpringValue, type: PoleType } & JSX.IntrinsicElements['group']) => {
  const positionZ = useMemo(() => {
    return type === 'RIGHT' ?
      (BANNER_DEPTH * 0.5) + (POLE_DEPTH * -0.5) :
      (BANNER_DEPTH * -0.5) + (POLE_DEPTH * 0.5);
  }, []);

  return (
    <group position-y={POLE_HEIGHT * 0.5} position-z={positionZ}>
      <Box args={[POLE_WIDTH,POLE_HEIGHT,POLE_DEPTH]} position={props.position} castShadow={true} receiveShadow={true}>
        {/* @ts-ignore */}
        <animated.meshStandardMaterial
          metalness={0.15}
          roughness={0.75}
          color={POLE_COLOR}
          transparent={true}
          opacity={opacity}
        />
      </Box>
    </group>
  );
};

const Sensor = ({ onHit, ...props } : { onHit: () => void } & JSX.IntrinsicElements['group']) => {
  const onIntersectionEnter = useCallback(() => {
    if (isHit) return;

    isHit = true;
    setTimeout(() => { isHit = false; }, 1000);

    onHit();
  }, [onHit]);

  return (
    <group position-y={BuggyRunConstants.objectHeight}>
      <CuboidCollider
        args={[BANNER_WIDTH * 0.5, BuggyRunConstants.objectHeight, BANNER_DEPTH * 0.5]}
        position={props.position}
        sensor={true}
        onIntersectionEnter={onIntersectionEnter}
      />
    </group>
  );
};

const Finish = ({ opacity, onHit, ...props } : { opacity: SpringValue, onHit: () => void } & JSX.IntrinsicElements['group']) => {

  return (
    <group position-x={BuggyRunConstants.objectWidth * 0.5}>
      <Banner opacity={opacity} position={props.position}/>
      <Pole opacity={opacity} type={'LEFT'} position={props.position}/>
      <Pole opacity={opacity} type={'RIGHT'} position={props.position}/>
      <Sensor onHit={onHit} position={props.position} />
    </group>
  );
};

export { Finish }