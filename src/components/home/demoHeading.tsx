/* eslint-disable @typescript-eslint/ban-ts-comment */
import {animated, SpringValue} from "@react-spring/three";
import {Center, Text3D} from "@react-three/drei";

const uiColor = 0x2176AE;

const DemoHeading = ({ opacity }: { opacity: SpringValue }) => {
  return <>
    <Center position={[0, 1.8, 0]}>
      <Text3D
        castShadow={true}
        receiveShadow={true}
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
          metalness={0.45}
          roughness={0.75}
          color={uiColor}
          transparent={true}
          opacity={opacity}
        />
      </Text3D>
    </Center>
    <Center position={[0, 0.8, 0]}>
      <Text3D
        castShadow={true}
        receiveShadow={true}
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
        {"DEMOS"}
        {/* @ts-ignore */}
        <animated.meshStandardMaterial
          metalness={0.45}
          roughness={0.75}
          color={uiColor}
          transparent={true}
          opacity={opacity}
        />
      </Text3D>
    </Center>
  </>
}

export { DemoHeading }