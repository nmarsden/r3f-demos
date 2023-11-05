/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  Text3D,
  Center, Float
} from "@react-three/drei";
import {animated} from "@react-spring/three";

const uiColor = "#DDDDDD";

const Heading = ({ text, opacity }: { text: string, opacity: number }) => {

  const heading = `${text}`;
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
        {heading}
        {/* @ts-ignore */}
        <animated.meshStandardMaterial
          metalness={0.75}
          roughness={0.25}
          color={uiColor}
          transparent={true}
          opacity={opacity}
        />
      </Text3D>
    </Center>
  </>
}

const Test = ({ text, opacity }: { text: string, opacity: number }) => {
  return (
    <>
      <Float>
        <Heading text={text} opacity={opacity}/>
      </Float>
    </>
  )
}

export { Test }