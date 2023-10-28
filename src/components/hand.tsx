/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  OrbitControls,
  Environment,
  Billboard,
  Text3D,
  Center,
  useGLTF,
  Bvh
} from "@react-three/drei";
import {useRef} from "react";
import * as THREE from "three";
import {OrbitControls as OrbitControlsRef} from 'three-stdlib'
import {Robohand2Model} from "./robohand2Model";

const uiColor = "#c35d20";

const Lights = () => {
  const spotLight = useRef<THREE.SpotLight>(null!);
  return <>
    <ambientLight intensity={0.25} />
    <spotLight ref={spotLight} angle={0.51} intensity={100} castShadow={true} position={[0, 10, 0]} />
  </>
}

const Heading = () => {
  return <Billboard
    follow={true}
    lockX={false}
    lockY={false}
    lockZ={false}
  >
    <Center position={[0, 12, -15]}>
      <Text3D
        curveSegments={32}
        bevelEnabled
        bevelSize={0.3}
        bevelThickness={0.15}
        height={0.5}
        lineHeight={0.5}
        letterSpacing={0.15}
        size={2.5}
        font="/shapes/Inter_Bold.json"
      >
        {"HAND"}
        <meshStandardMaterial metalness={0.0} roughness={0.25} color={uiColor}/>
      </Text3D>
    </Center>
  </Billboard>
}

useGLTF.preload('/hand/scene.gltf')

const Hand = () => {
  const orbitControls = useRef<OrbitControlsRef>(null!)

  return (
    <>
      <Bvh firstHitOnly>
        <Lights />
        <Heading />
        <Robohand2Model scale={0.12} position={[0, 0.5, 0]} rotation={[0, -Math.PI * 0.05, -Math.PI/4]}/>
        <mesh position={[0, -1.3, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow={true}>
          <planeGeometry args={[1000,1000]}/>
          <shadowMaterial opacity={1} />
        </mesh>
        <Environment preset={'warehouse'} background blur={1}/>
        <OrbitControls
          ref={orbitControls}
          makeDefault={true}
          maxPolarAngle={Math.PI / 2}
          autoRotate={false}
          autoRotateSpeed={0.25}
          enableZoom={false}
          enablePan={false}
        />
      </Bvh>
    </>
  )
}

export { Hand }