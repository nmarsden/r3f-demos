/* eslint-disable @typescript-eslint/ban-ts-comment */

/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.13 public/buggy-run/jeep.glb -o src/components/buggy-run/jeepModel.tsx --transform -j --types
Files: public/buggy-run/jeep.glb [230.19KB] > jeep-transformed.glb [95.42KB] (59%)
*/

import * as THREE from 'three'
import {Trail, useGLTF} from '@react-three/drei'
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
import {BuggyRunConstants} from "./buggyRunConstants.ts";

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

const WHEELS: WheelInfo[] = [REAR_RIGHT_WHEEL, REAR_LEFT_WHEEL, FRONT_RIGHT_WHEEL, FRONT_LEFT_WHEEL];

const EXCLUDE_FROM_CHASSIS = [
  ...REAR_RIGHT_WHEEL.nodeIndexes,
  ...REAR_LEFT_WHEEL.nodeIndexes,
  ...FRONT_RIGHT_WHEEL.nodeIndexes,
  ...FRONT_LEFT_WHEEL.nodeIndexes,
];

const MASS_FACTOR = 1.75;

const BODY_TOP_MASS = 0;
const BODY_MIDDLE_MASS = 0;
const BODY_BOTTOM_MASS = 8 * MASS_FACTOR;
const WHEEL_MASS = 5 * MASS_FACTOR;

// @ts-ignore
type WheelRef = {
  pause: () => void;
  setMotorVelocity: (velocity: number) => void;
} | null;

type WheelProps = {
  opacity: SpringValue;
  wheelInfo: WheelInfo;
  body: RefObject<RapierRigidBody>;
  nodes: GLTFResult['nodes'];
  materials: GLTFResult['materials'];
};

const Wheel = forwardRef<WheelRef, WheelProps>(({ opacity, wheelInfo, body, nodes, materials } : WheelProps, ref) => {
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

  useImperativeHandle(ref, () => ({
    pause: () => {
      wheel.current?.setEnabled(false);
    },
    setMotorVelocity: (velocity: number) => {
      joint.current?.configureMotorVelocity(velocity, 10);
    }
  }), [wheel, joint]);

  // configure joint
  useEffect(() => {
    if (!wheel.current) return;

    joint.current?.configureMotorModel(1); // Force based
    joint.current?.setContactsEnabled(false);
  }, [wheel, joint])

  return (
    <RigidBody
      position={wheelPosition}
      ref={wheel}
      colliders={false}
      type="dynamic"
    >
      <BallCollider
        args={[1.1]} mass={WHEEL_MASS}
        rotation={[0, 0, Math.PI * 0.5]}
        position={[(wheelInfo.side === 'left' ? -0.3 : 0.3),0,0]}
        name="jeepBodyWheel"
      />
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
});

type CameraState = 'STANDARD' | 'ZOOMED-OUT';
type CameraSettings = {
  lerpAlpha: number;
  offsetY: number;
  offsetZ: number;
}

const chassisPosition = new THREE.Vector3();
const cameraTarget = new THREE.Vector3(0, 0, 0);
const CAMERA_SETTINGS: Map<CameraState, CameraSettings> = new Map([
  ['STANDARD',    { lerpAlpha: 0.1, offsetY: 0, offsetZ: 20   }],
  ['ZOOMED-OUT',  { lerpAlpha: 0.1, offsetY: 0, offsetZ: 50 }]
]);
let cameraState: CameraState = 'STANDARD';
let cameraSettings = CAMERA_SETTINGS.get(cameraState) as CameraSettings;

const switchCameraState = (newCameraState: CameraState): void => {
  cameraState = newCameraState;
  cameraSettings = CAMERA_SETTINGS.get(cameraState) as CameraSettings;
}

export type VelocityChangedEvent = {
  velocity: number;
};

export type JeepModelRef = {
  jump: () => void;
  boost: () => void;
  pause: () => void;
  reset: () => void;
  pedalDown: () => void;
  pedalUp: () => void;
} | null;

type JeepModelProps = {
  opacity: SpringValue;
  onVelocityChanged: (event: VelocityChangedEvent) => void;
};

const JeepModel = forwardRef<JeepModelRef, JeepModelProps>(({ opacity, onVelocityChanged } : JeepModelProps, ref) => {
  const { nodes, materials } = useGLTF('/r3f-demos/buggy-run/jeep-transformed.glb') as GLTFResult
  const light = useRef<THREE.DirectionalLight>(null!);
  const body = useRef<RapierRigidBody | null>(null);
  const wheels = useRef<WheelRef[]>([]);
  const chassis = useRef<THREE.Group>(null!);
  const {camera} = useThree();
  const [showBoost, setShowBoost] = useState(false);
  const [velocity, setVelocity] = useState(0);
  const [respawn, setRespawn] = useState(false);

  useImperativeHandle(ref, () => ({
    jump: () => {
      const impulse = new THREE.Vector3(0, BuggyRunConstants.jumpForce, 0);
      const point = vec3(body.current?.translation()).add(new THREE.Vector3(-0.2,0,0));
      body.current?.applyImpulseAtPoint(impulse, point, true);
    },
    boost: () => {
      const impulse = new THREE.Vector3(500, 0, 0);
      const point = vec3(body.current?.translation()).add(new THREE.Vector3(0,0,0));
      body.current?.applyImpulseAtPoint(impulse, point, true);
      setShowBoost(true);
      // Show boost for 2 seconds
      setTimeout(() => {
        setShowBoost(false);
      }, 2000);
    },
    pause: () => {
      body.current?.setEnabled(false);
      switchCameraState("STANDARD");

      wheels.current?.forEach(wheel => {
        // @ts-ignore
        wheel.pause();
      })
    },
    reset: () => {
      setRespawn(true);
      switchCameraState("STANDARD");

      setTimeout(() => {
        body.current = null;
        setRespawn(false);
      }, 100);
    },
    pedalDown: () => {
      wheels.current?.forEach(wheel => {
        const bodyVelocity = body.current.linvel().x
        if (bodyVelocity < 1) {
          const force = new THREE.Vector3(50, 0, 0);
          const point = vec3(body.current?.translation()).add(new THREE.Vector3(0, 0, 0));
          body.current?.applyImpulseAtPoint(force, point, true);
        }

        // @ts-ignore
        wheel.setMotorVelocity(30);
      })
    },
    pedalUp: () => {
      wheels.current?.forEach(wheel => {
        // @ts-ignore
        wheel.setMotorVelocity(0);
      })
    }
  }), [body, wheels]);

  useEffect(() => {
    if (!light.current || !chassis.current) return;

    light.current.target = chassis.current;

  }, [chassis.current, light.current]);

  // initially after 1 second, zoom-out & force the jeep forward for 2 seconds
  useEffect(() => {
    setTimeout(() => {
      switchCameraState("ZOOMED-OUT");
    }, 1000);

  }, [body.current]);

  useFrame(() => {
    if (opacity.isAnimating || chassis.current === null || !body.current || respawn) {
      return;
    }

    const bodyVelocity = body.current.linvel().x

    // Handle velocity has changed
    if (velocity != bodyVelocity) {
      setVelocity(bodyVelocity);
      onVelocityChanged({ velocity: bodyVelocity });
    }

    // Move the camera to follow the jeep
    chassis.current.getWorldPosition(chassisPosition);

    cameraTarget.lerp(chassisPosition, 1);

    camera.rotation.set(0,0,0,'XYZ');
    camera.position.setX(cameraTarget.x);
    camera.position.setY(THREE.MathUtils.lerp(camera.position.y, cameraTarget.y + cameraSettings.offsetY, cameraSettings.lerpAlpha));
    camera.position.setZ(THREE.MathUtils.lerp(camera.position.z, cameraTarget.z + cameraSettings.offsetZ + (bodyVelocity * 1.2), cameraSettings.lerpAlpha));

    // Move the light to follow the jeep
    light.current.position.setX(chassisPosition.x);
    light.current.position.setY(chassisPosition.y + 10);
  })

  return (opacity.isAnimating ? null : (
    <>
      <directionalLight ref={light} args={[ 0xdddddd, 10 ]} castShadow={true} />
      {respawn ? null :
      <group position={[BuggyRunConstants.objectWidth,2.5,0]} rotation={[0, Math.PI * 0.5, 0]} >
        {/* --- Body --- */}
        <RigidBody
          ref={body}
          colliders={false}
          type="dynamic"
          enabledRotations={[false, false, true]}
          angularDamping={150}
        >
          <CuboidCollider args={[1.1,0.88,1.7]} position={[0,3.6,-1.5]} mass={BODY_TOP_MASS} name="jeepBodyTop" />
          <CuboidCollider args={[1.6,0.8,3]} position={[0,2,-0.15]} mass={BODY_MIDDLE_MASS} name="jeepBodyMiddle" />
          <CuboidCollider args={[1.1,1,2.5]} position={[0,0.4,-0.15]} mass={BODY_BOTTOM_MASS} name="jeepBodyBottom" />
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
          {/* --- Boost --- */}
          {showBoost ? (
            <Trail
              width={10} // Width of the line
              color={'orange'} // Color of the line
              length={2} // Length of the line
              decay={1} // How fast the line fades away
              local={false} // Whether to use the target's world or local positions
              stride={0.2} // Min distance between previous and current point
              interval={1} // Number of frames to wait before next calculation
              target={undefined} // Optional target. This object will produce the trail.
              attenuation={(width) => width} // A function to define the width in each point along it.
            >
              <mesh position={[0,1,-3]}>
                <sphereGeometry args={[0.2]}/>
                <meshStandardMaterial
                  transparent={true}
                  opacity={0.5}
                />
              </mesh>
            </Trail>
          ) : null}
        </RigidBody>
        {/* --- Wheels --- */}
        {WHEELS.map((wheel, index) => {
          return (
            <Wheel
              key={`wheel-${index}`}
              ref={(wheelRef) => wheels.current[index] = wheelRef}
              opacity={opacity}
              body={body}
              wheelInfo={wheel}
              nodes={nodes}
              materials={materials}
            />
          );
        })}
      </group>
      }
    </>
    )
  )
});

useGLTF.preload('/r3f-demos/buggy-run/jeep-transformed.glb')

export { JeepModel }