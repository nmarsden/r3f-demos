/* eslint-disable @typescript-eslint/ban-ts-comment */
import {SpringValue, animated} from "@react-spring/three";
import {Billboard, ScreenSpace, Text} from "@react-three/drei";
import {Vector3} from "three";

const POSITION_HEADING = new Vector3(0, 0.58, 0);
const POSITION_SCORE = new Vector3(0, 0.48, 0);

const CustomText = ({ opacity, position, size, text, color, outlineColor } : { opacity: SpringValue, position: Vector3, size: number, text: string, color: string | number, outlineColor: string | number }) => {
  return (
    <Text position={position} fontSize={size} letterSpacing={0.1} outlineWidth={0.01} outlineColor={outlineColor}>
      { /* @ts-ignore */ }
      <animated.meshStandardMaterial
        metalness={1}
        roughness={1}
        color={color}
        transparent={true}
        opacity={opacity}
      />
      {text}
    </Text>
  )
}
const Score = ({ opacity, score }: { opacity: SpringValue, score: number }) => {
  return (
    <>
      <ScreenSpace depth={1}>
        <Billboard>
          <CustomText opacity={opacity} position={POSITION_HEADING} size={0.05} text={'SCORE'} color={0xFFFFFF} outlineColor={0x333333}/>
          <CustomText opacity={opacity} position={POSITION_SCORE} size={0.1} text={`${score}`} color={0x333333} outlineColor={0xFFFFFF}/>
        </Billboard>
      </ScreenSpace>
    </>
  )
}

export { Score }
