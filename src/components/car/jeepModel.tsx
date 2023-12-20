/* eslint-disable @typescript-eslint/ban-ts-comment */

/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.13 public/car/jeep.glb -o src/components/car/jeepModel.tsx --transform -j --types 
Files: public/car/jeep.glb [230.19KB] > jeep-transformed.glb [95.42KB] (59%)
*/

import * as THREE from 'three'
import {useGLTF} from '@react-three/drei'
import {GLTF} from 'three-stdlib'
import {animated, SpringValue} from "@react-spring/three";
import {forwardRef, RefObject, useEffect, useImperativeHandle, useMemo, useRef, useState} from "react";
import {
  RigidBody,
  RapierRigidBody,
  useRevoluteJoint,
  CuboidCollider,
  BallCollider, vec3
} from "@react-three/rapier";
import {useFrame, useThree} from "@react-three/fiber";

type GLTFResult = GLTF & {
  nodes: {
    Cube006_Cube001: THREE.Mesh           // roll cage
    Cylinder003: THREE.Mesh               // wheel: front-right
    Circle003: THREE.Mesh                 // wheel-hub: front-right
    Circle002: THREE.Mesh                 // wheel-hub: rear-right
    Cylinder002: THREE.Mesh               // wheel: rear-right
    Cube005_Cube008: THREE.Mesh           // suspension
    Cube003_Cube006: THREE.Mesh           // differential
    Cube002_Cube005: THREE.Mesh           // axel: rear
    Cube001_Cube004: THREE.Mesh           // axel: front
    Cylinder001: THREE.Mesh               // wheel: rear-left
    Circle001: THREE.Mesh                 // wheel-hub: rear-left
    ['Cube_Cube002-Mesh']: THREE.Mesh     // trim
    ['Cube_Cube002-Mesh_1']: THREE.Mesh   // body
    ['Cube_Cube002-Mesh_2']: THREE.Mesh   // lights
    ['Cube_Cube002-Mesh_3']: THREE.Mesh   // windshield
    Circle: THREE.Mesh                    // wheel-hub: front-left
    Cylinder: THREE.Mesh                  // wheel: front-left
  }
  materials: {
    PaletteMaterial001: THREE.MeshStandardMaterial
  }
}

type WheelInfo = {
  nodeIndexes: number[];
  nodeHubName: string;
  side: 'left' | 'right';
}

const REAR_RIGHT_WHEEL: WheelInfo = {
  nodeIndexes: [3, 4], // hub & wheel
  nodeHubName: 'Circle002',
  side: 'right'
};
const REAR_LEFT_WHEEL: WheelInfo = {
  nodeIndexes: [9, 10], // wheel & hub
  nodeHubName: 'Circle001',
  side: 'left'
};
const FRONT_RIGHT_WHEEL: WheelInfo = {
  nodeIndexes: [1, 2], // wheel & hub
  nodeHubName: 'Circle003',
  side: 'right'
};
const FRONT_LEFT_WHEEL: WheelInfo = {
  nodeIndexes: [16, 17], // hub & wheel
  nodeHubName: 'Circle',
  side: 'left'
};

const EXCLUDE_FROM_CHASSIS = [
  ...REAR_RIGHT_WHEEL.nodeIndexes,
  ...REAR_LEFT_WHEEL.nodeIndexes,
  ...FRONT_RIGHT_WHEEL.nodeIndexes,
  ...FRONT_LEFT_WHEEL.nodeIndexes,
];

const MASS_FACTOR = 1.25;

const BODY_TOP_MASS = MASS_FACTOR;
const BODY_MIDDLE_MASS = 0;
const BODY_BOTTOM_MASS = 8 * MASS_FACTOR;
const WHEEL_MASS = 5 * MASS_FACTOR;


type WheelProps = {
  opacity: SpringValue;
  wheelInfo: WheelInfo;
  body: RefObject<RapierRigidBody>;
  nodes: GLTFResult['nodes'];
  materials: GLTFResult['materials'];
};

function Wheel({ opacity, wheelInfo, body, nodes, materials } : WheelProps) {
  const wheel = useRef<RapierRigidBody | null>(null);
  const { wheelPosition, inverseWheelPosition } = useMemo(() => {
    // @ts-ignore
    const mesh: THREE.Mesh = nodes[wheelInfo.nodeHubName] as THREE.Mesh;
    const pos = mesh.geometry.boundingBox?.getCenter(new THREE.Vector3()) as THREE.Vector3;
    const wheelPosition = [pos.x, 0, pos.z] as THREE.Vector3Tuple;
    const inverseWheelPosition = [-pos.x, -pos.y, -pos.z] as THREE.Vector3Tuple;

    return {
      wheelPosition,
      inverseWheelPosition
    };
  }, [nodes, body, wheel]);

  const joint = useRevoluteJoint(body, wheel, [wheelPosition, [0,0,0], [1, 0, 0]]);

  useEffect(() => {
    joint.current?.configureMotorModel(1); // Force based
    joint.current?.setContactsEnabled(false);
    joint.current?.configureMotorVelocity(25, 20);
  }, [])

  return (
    <RigidBody
      position={wheelPosition}
      ref={wheel}
      colliders={false}
      type="dynamic"
    >
      <BallCollider args={[1.1]} mass={WHEEL_MASS} rotation={[0, 0, Math.PI * 0.5]} position={[(wheelInfo.side === 'left' ? -0.3 : 0.3),0,0]}/>
      <group>
        {Object.values(nodes)
        .filter((_node, index) => wheelInfo.nodeIndexes.includes(index))
        .map((node, index) => {
          // @ts-ignore
          return <animated.mesh
            key={`${index}`}
            geometry={node.geometry}
            castShadow={true}
            position={inverseWheelPosition} /* reset position to [0,0,0] */
          >
            {/* @ts-ignore */}
            <animated.meshStandardMaterial
              {...materials.PaletteMaterial001}
              transparent={true}
              opacity={opacity}
            />
          </animated.mesh>
        })}
      </group>
    </RigidBody>
  );
}

const chassisPosition = new THREE.Vector3()
const cameraTarget = new THREE.Vector3(0, 0, 0)

export type JeepModelRef = {
  jump: () => void;
  boost: () => void;
} | null;

type JeepModelProps = {
  opacity: SpringValue;
  onBoostCompleted: () => void;
};

const JeepModel = forwardRef<JeepModelRef, JeepModelProps>(({ opacity, onBoostCompleted } : JeepModelProps, ref) => {
  const { nodes, materials } = useGLTF('/r3f-demos/car/jeep-transformed.glb') as GLTFResult
  const light = useRef<THREE.DirectionalLight>(null!);
  const body = useRef<RapierRigidBody | null>(null);
  const chassis = useRef<THREE.Group>(null!);
  const {camera} = useThree();
  const [boosted, setBoosted] = useState(false);

  useImperativeHandle(ref, () => ({
    jump: () => {
      const impulse = new THREE.Vector3(0, 500, 0);
      const point = vec3(body.current?.translation()).add(new THREE.Vector3(-0.05,0,0));
      body.current?.applyImpulseAtPoint(impulse, point, true);
    },
    boost: () => {
      const impulse = new THREE.Vector3(500, 0, 0);
      const point = vec3(body.current?.translation()).add(new THREE.Vector3(0,0,0));
      body.current?.applyImpulseAtPoint(impulse, point, true);
      setBoosted(true);
    }
  }), [body]);

  useEffect(() => {
    if (!light.current || !chassis.current) return;

    light.current.target = chassis.current;

  }, [chassis.current, light.current]);

  useFrame(() => {
    if (opacity.isAnimating || chassis.current === null || !body.current) {
      return;
    }

    if (boosted && body.current.linvel().x < 28) {
      setBoosted(false);
      onBoostCompleted();
    }

    // Move the camera to follow the ball
    chassis.current.getWorldPosition(chassisPosition);

    cameraTarget.lerp(chassisPosition, 1)
    camera.position.setX(cameraTarget.x);
    camera.position.setY(cameraTarget.y + 30);
    camera.position.setZ(cameraTarget.z + 30);

    // Move the light to follow the ball
    light.current.position.setX(chassisPosition.x);
    light.current.position.setY(chassisPosition.y + 10);
  })

  return (opacity.isAnimating ? null : (
    <>
      <directionalLight ref={light} args={[ 0xdddddd, 10 ]} castShadow={true} />
      <group position={[0,2,0]} rotation={[0, Math.PI * 0.5, 0]} >
        {/* --- Body --- */}
        <RigidBody
          ref={body}
          colliders={false}
          type="dynamic"
          enabledRotations={[false, false, true]}
        >
          <CuboidCollider args={[1.1,0.88,1.7]} position={[0,3.6,-1.1]} mass={BODY_TOP_MASS} />
          <CuboidCollider args={[1.6,0.8,3]} position={[0,2,-0.15]} mass={BODY_MIDDLE_MASS} />
          <CuboidCollider args={[1.1,1,2.5]} position={[0,0.4,-0.15]} mass={BODY_BOTTOM_MASS}/>
          <group position-y={-1.1} ref={chassis}>
            {Object.values(nodes)
              .filter((_node, index) => !EXCLUDE_FROM_CHASSIS.includes(index))
              .map((node, index) => {
              // @ts-ignore
              return <animated.mesh
                key={`${index}`}
                geometry={node.geometry}
                castShadow={true}
              >
                {/* @ts-ignore */}
                <animated.meshStandardMaterial
                  {...materials.PaletteMaterial001}
                  transparent={true}
                  opacity={opacity}
                />
              </animated.mesh>
            })}
          </group>
        </RigidBody>
        {/* --- Wheels --- */}
        <Wheel opacity={opacity} body={body} wheelInfo={FRONT_LEFT_WHEEL} nodes={nodes} materials={materials} />
        <Wheel opacity={opacity} body={body} wheelInfo={FRONT_RIGHT_WHEEL} nodes={nodes} materials={materials} />
        <Wheel opacity={opacity} body={body} wheelInfo={REAR_LEFT_WHEEL} nodes={nodes} materials={materials} />
        <Wheel opacity={opacity} body={body} wheelInfo={REAR_RIGHT_WHEEL} nodes={nodes} materials={materials} />
      </group>
    </>
    )
  )
});

useGLTF.preload('/r3f-demos/car/jeep-transformed.glb')

export { JeepModel }