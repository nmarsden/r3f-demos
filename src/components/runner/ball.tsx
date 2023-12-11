/* eslint-disable @typescript-eslint/ban-ts-comment */
import {SpringValue, animated} from "@react-spring/three";
import {useEffect, useRef} from "react";
import {RapierRigidBody, RigidBody} from "@react-three/rapier";
import {Sphere, useTexture} from "@react-three/drei";
import {useFrame, useThree} from "@react-three/fiber";
import * as THREE from "three";
import {useTransitionState} from "../../hooks/transitionState.ts";
// import {MainContext} from "../../mainContext.ts";

const BALL_SIZE = 0.4;
// const BALL_SIZE = 0.18;

type BallProps = {
  opacity: SpringValue;
};

const vec = new THREE.Vector3()
const cameraTarget = new THREE.Vector3(0, 0, 0)

const Ball = ({ opacity }: BallProps) => {
  const { camera } = useThree();
  const transitionState = useTransitionState(opacity);
  // const mainContext = useContext(MainContext)
  const rigidBodyRef = useRef<RapierRigidBody>(null!);
  const texture = useTexture('/r3f-demos/maze/ball-texture.jpg')
  const ref = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (opacity.isAnimating || ref.current === null) {
      return;
    }

    // Have the camera follow the ball
    cameraTarget.lerp(ref.current.getWorldPosition(vec), 0.03)
    state.camera.lookAt(cameraTarget);
    state.camera.position.setX(cameraTarget.x);
    state.camera.position.setY(cameraTarget.y + 2);
    state.camera.position.setZ(cameraTarget.z + 10);
    // state.camera.updateMatrixWorld(true);
    // state.camera.updateProjectionMatrix();

    // if (mainContext.controls.current) {
    //   mainContext.controls.current.target.setX(cameraTarget.x);
    //   mainContext.controls.current.target.setY(cameraTarget.y + 2);
    //   mainContext.controls.current.target.setZ(0);
    //   mainContext.controls.current.update();
    // }
  })

  useEffect(() => {
    if (transitionState === 'LEAVING') {
      // reset camera
      cameraTarget.set(0, 0, 0);
      camera.lookAt(cameraTarget);
      camera.position.setX(cameraTarget.x);
      camera.position.setY(cameraTarget.y + 2);
      camera.position.setZ(cameraTarget.z + 10);
    }

  }, [transitionState]);

  useEffect(() => {
    if (rigidBodyRef.current === null) return;

    // Move the ball to the right
    // rigidBodyRef.current.addForce(new THREE.Vector3(0.1, 0, 0), true);

  }, [rigidBodyRef.current])

  return (
    <>
      {(opacity.isAnimating) ? (
        <></>
      ) : (
        <RigidBody ref={rigidBodyRef} name={'Ball'} colliders={'ball'}>
          <Sphere
            ref={ref}
            args={[BALL_SIZE, 64, 32]}
            position={[0, 2, 0]}
            rotation-x={Math.PI * -0.5}
            rotation-y={Math.PI * -0.1}
          >
            { /* @ts-ignore */ }
            <animated.meshStandardMaterial
              map={texture}
              metalness={0.45}
              roughness={0.75}
              color={'orange'}
              transparent={false}
              opacity={opacity}
            />
          </Sphere>
        </RigidBody>
      )}
    </>
  )
}

export { Ball }