/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  Text3D,
  Center, Float
} from "@react-three/drei";
import {animated} from "@react-spring/three";

const uiColor = 0x2176AE;

const Heading = ({ opacity }: { opacity: number }) => {
  return <>
    <Center position={[0, 1, 0]}>
      <Text3D
        castShadow={true}
        curveSegments={20}
        bevelEnabled
        bevelSize={0.02}
        bevelThickness={0.1}
        height={0.25}
        lineHeight={0.75}
        letterSpacing={0.001}
        size={0.75}
        font="/shapes/Inter_Bold.json"
      >
        {"R3F"}
        {/* @ts-ignore */}
        <animated.meshStandardMaterial
          metalness={0.75}
          roughness={0.15}
          color={uiColor}
          transparent={true}
          opacity={opacity}
        />
      </Text3D>
    </Center>
    <Center position={[0, 0, 0]}>
      <Text3D
        castShadow={true}
        curveSegments={20}
        bevelEnabled
        bevelSize={0.02}
        bevelThickness={0.1}
        height={0.25}
        lineHeight={0.75}
        letterSpacing={0.001}
        size={0.75}
        font="/shapes/Inter_Bold.json"
      >
        {"DEMO"}
        {/* @ts-ignore */}
        <animated.meshStandardMaterial
          metalness={0.75}
          roughness={0.15}
          color={uiColor}
          transparent={true}
          opacity={opacity}
        />
      </Text3D>
    </Center>
  </>
}

const Home = ({ opacity }: { opacity: number }) => {
  return (
    <>
      <Float>
        <Heading opacity={opacity}/>
      </Float>
    </>
  )
}

export { Home }