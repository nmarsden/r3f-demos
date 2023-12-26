/* eslint-disable @typescript-eslint/ban-ts-comment */

import * as THREE from "three";
import {animated, SpringValue} from "@react-spring/three";
import {Box, Cylinder, Lathe, RoundedBox, Text} from "@react-three/drei";
import {ReactNode, useEffect, useMemo, useState} from "react";
import {useFrame} from "@react-three/fiber";

type GaugeSegmentProps = {
  color: THREE.Color;
  rotationY: number;
}
const NUM_GAUGE_SEGMENTS = 3;
const GAUGE_SEGMENT_THETA_GAP = Math.PI * 0.02;
const GAUGE_SEGMENT_THETA_LENGTH = (Math.PI - (GAUGE_SEGMENT_THETA_GAP * (NUM_GAUGE_SEGMENTS - 1))) / NUM_GAUGE_SEGMENTS;

const GAUGE_SEGMENT_INNER_RADIUS = 0.125;
const GAUGE_SEGMENT_OUTER_RADIUS = 0.225;
const GAUGE_SEGMENT_DEPTH = 0.075;

const GAUGE_SEGMENTS: GaugeSegmentProps[] = new Array(NUM_GAUGE_SEGMENTS);
for (let i=0; i<NUM_GAUGE_SEGMENTS; i++) {
  const hue = THREE.MathUtils.mapLinear(i, 0, NUM_GAUGE_SEGMENTS-1, 0, 0.3);
  GAUGE_SEGMENTS[i] = {
    color: new THREE.Color().setHSL(hue, 1, 0.5),
    rotationY: i * (GAUGE_SEGMENT_THETA_LENGTH + GAUGE_SEGMENT_THETA_GAP) - (Math.PI * -0.5),
  }
}

const Panel = ({ opacity, children } : { opacity: SpringValue, children: ReactNode }) => {
  return (
    <RoundedBox
      args={[0.78, 0.6, 0.5]}
      radius={0.18} // Radius of the rounded corners. Default is 0.05
      smoothness={32} // The number of curve segments. Default is 4
      bevelSegments={0} // The number of bevel segments. Default is 4, setting it to 0 removes the bevel, as a result the texture is applied to the whole geometry.
      creaseAngle={0.4} // Smooth normals everywhere except faces that meet at an angle greater than the crease angle
      position={[0, 0.48, -0.5]}
    >
      {/* @ts-ignore */}
      <animated.meshStandardMaterial
        metalness={0.45}
        roughness={0.75}
        color={0x000000}
        transparent={true}
        opacity={opacity}
      />
      {children}
    </RoundedBox>
  );
}

const Gauge = ({ opacity } : { opacity: SpringValue }) => {
  return (
    <>
      {GAUGE_SEGMENTS.map((props, index) => <GaugeSegment key={`${index}`} opacity={opacity} {...props} />)}
    </>
  );
}

const GaugeSegment = ({ opacity, ...props } : { opacity: SpringValue } & GaugeSegmentProps) => {
  const rectangleShape = useMemo(() => {
    const rectangleShape = new THREE.Shape();
    rectangleShape.moveTo(GAUGE_SEGMENT_INNER_RADIUS, 0);
    rectangleShape.lineTo(GAUGE_SEGMENT_OUTER_RADIUS, 0);
    rectangleShape.lineTo(GAUGE_SEGMENT_OUTER_RADIUS, GAUGE_SEGMENT_DEPTH);
    rectangleShape.lineTo(GAUGE_SEGMENT_INNER_RADIUS, GAUGE_SEGMENT_DEPTH);
    rectangleShape.lineTo(GAUGE_SEGMENT_INNER_RADIUS, 0);
    return rectangleShape;
  }, [])

  return (
    <Lathe
      args={[
        rectangleShape.getPoints(), // points
        32,                         // segments
        0,                          // phiStart
        GAUGE_SEGMENT_THETA_LENGTH, // phiLength
      ]}
      castShadow={true}
      receiveShadow={true}
      position={[0,0.04,GAUGE_SEGMENT_DEPTH * 0.5]}
      rotation={[Math.PI * 0.5,props.rotationY,0]}
    >
      { /* @ts-ignore */ }
      <animated.meshStandardMaterial
        metalness={0.45}
        roughness={0.75}
        color={props.color}
        transparent={true}
        opacity={opacity}
      />
    </Lathe>
  )
}

const Needle = ({ opacity, velocity } : { opacity: SpringValue, velocity: number }) => {
  const [desiredRotationZ, setDesiredRotationZ] = useState(Math.PI * -0.5);
  const [rotationZ, setRotationZ] = useState(Math.PI * -0.5);

  useEffect(() => {
    // assumes velocity range is 0 to 40
    let normalizedVelocity = velocity;
    if (velocity < 0) {
      normalizedVelocity = 0;
    }
    if (velocity > 40) {
      normalizedVelocity = 40;
    }
    setDesiredRotationZ(THREE.MathUtils.mapLinear(normalizedVelocity, 0, 40, Math.PI * -0.5, Math.PI * -1.5));
  }, [velocity]);

  useFrame(() => {
    if (opacity.isAnimating) return;

    setRotationZ(THREE.MathUtils.lerp(rotationZ, desiredRotationZ, 0.01));
  });

  return (
    <group
      position={[0, 0.03, 0.05]}
      rotation={[0,0,rotationZ]}
    >
      <Cylinder
        args={[0.035, 0.035, 0.05]}
        rotation={[Math.PI * 0.5, 0, 0]}
      >
        {/* @ts-ignore */}
        <animated.meshStandardMaterial
          metalness={1}
          roughness={1}
          color={'black'}
          transparent={true}
          opacity={opacity}
        />
        <group
          position={[0, 0.04, -0.02]}
          rotation={[Math.PI * 0.5, 0, 0]}
        >
          <Cylinder
            args={[0.01, 0.01, 0.2]}
            position={[0, 0.1, -0.02]}
          >
            {/* @ts-ignore */}
            <animated.meshStandardMaterial
              metalness={0.5}
              roughness={1}
              color={'black'}
              transparent={true}
              opacity={opacity}
            />
          </Cylinder>
        </group>
      </Cylinder>
    </group>
  );
}

const BoostIndicator = ({ opacity } : { opacity: SpringValue }) => {
  return (
    <Box
      args={[0.25, 0.08, 0.025]}
      position={[0, -0.06, 0.08]}
    >
      {/* @ts-ignore */}
      <animated.meshStandardMaterial
        metalness={0.45}
        roughness={0.75}
        color={'red'}
        transparent={true}
        opacity={1}
      />
      <Text position={[0,-0.006,0.0125]} fontSize={0.05} letterSpacing={0.1} outlineWidth={0.002} outlineColor={'white'}>
        { /* @ts-ignore */ }
        <animated.meshStandardMaterial
          metalness={1}
          roughness={1}
          color={'white'}
          transparent={true}
          opacity={opacity}
        />
        BOOST
      </Text>
    </Box>
  );
}

const DashBoard = ({ opacity, velocity } : { opacity: SpringValue, velocity: number }) => {
  return (
    <Panel opacity={opacity}>
      <Gauge opacity={opacity} />
      <Needle opacity={opacity} velocity={velocity}/>
      <BoostIndicator opacity={opacity} />
    </Panel>
  );
};

export { DashBoard }