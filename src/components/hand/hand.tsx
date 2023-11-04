/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  OrbitControls,
  Billboard,
  Text3D,
  Center,
  useGLTF,
  Bvh
} from "@react-three/drei";
import {useRef} from "react";
import {OrbitControls as OrbitControlsRef} from 'three-stdlib'
import {Robohand2Model} from "./robohand2Model";
import {animated} from "@react-spring/three";

const uiColor = "#DDDDDD";

const Heading = ({ opacity }: { opacity: number }) => {
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
        {/* @ts-ignore */}
        <animated.meshStandardMaterial
          metalness={0.0}
          roughness={0.25}
          color={uiColor}
          transparent={true}
          opacity={opacity}
        />
      </Text3D>
    </Center>
  </Billboard>
}

useGLTF.preload('/hand/scene.gltf')

const Hand = ({ opacity }: { opacity: number }) => {
  const orbitControls = useRef<OrbitControlsRef>(null!)

  return (
    <>
      <Bvh firstHitOnly>
        <Heading opacity={opacity}/>
        <Robohand2Model scale={0.12} position={[0, 0.5, 0]} rotation={[0, -Math.PI * 0.05, -Math.PI/4]} opacity={opacity}/>
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