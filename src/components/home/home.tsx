/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  OrbitControls,
  Text3D,
  Center, Float
} from "@react-three/drei";
import {useRef} from "react";
import {OrbitControls as OrbitControlsRef} from 'three-stdlib'
import {animated} from "@react-spring/three";

const uiColor = "#DDDDDD";

const Heading = ({ opacity }: { opacity: number }) => {
  return <>
    <Center position={[0, 0, 0]}>
      <Text3D
        castShadow={true}
        curveSegments={8}
        bevelEnabled
        bevelSize={0.02}
        bevelThickness={1}
        height={0.25}
        lineHeight={0.6}
        letterSpacing={0.1}
        size={0.75}
        font="/shapes/Inter_Bold.json"
      >
        {"        R3F\nExperiments"}
        {/* @ts-ignore */}
        <animated.meshStandardMaterial
          roughness={0.25}
          metalness={0.75}
          color={uiColor}
          transparent={true}
          opacity={opacity}
        />
      </Text3D>
    </Center>
  </>
}

const Home = ({ opacity }: { opacity: number }) => {
  const orbitControls = useRef<OrbitControlsRef>(null!)

  return (
    <>
      <Float>
        <Heading opacity={opacity}/>
      </Float>
      <OrbitControls
        ref={orbitControls}
        makeDefault={true}
        maxPolarAngle={Math.PI / 1}
        autoRotate={false}
        autoRotateSpeed={0.25}
        enableZoom={false}
        enablePan={false}
      />
    </>
  )
}

export { Home }