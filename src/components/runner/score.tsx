/* eslint-disable @typescript-eslint/ban-ts-comment */
import {SpringValue, animated} from "@react-spring/three";
import {Billboard, ScreenSpace, Text} from "@react-three/drei";
import {useRef} from "react";
import {Vector3} from "three";

const POSITION_HEADING = new Vector3(0, 0.58, 0);
const POSITION_SCORE = new Vector3(0, 0.48, 0);

const CustomText = ({ opacity, position, size, text, color, outlineColor } : { opacity: SpringValue, position: Vector3, size: number, text: string, color: string | number, outlineColor: string | number }) => {
  const textRef = useRef<Text>(null!);

  return (
    <Text ref={textRef} position={position} fontSize={size} letterSpacing={0.1} outlineWidth={0.01} outlineColor={outlineColor}>
      { /* @ts-ignore */ }
      <animated.meshStandardMaterial
        metalness={0.75}
        roughness={0.25}
        color={color}
        transparent={true}
        opacity={opacity}
      />
      {text}
      { /* @ts-ignore */ }
      { text.current ? <spotLight angle={0.25} intensity={10} position={[0, 0, 1]} color={'white'} target={text.current}/> : null }
    </Text>
  )
}
const Score = ({ opacity, score }: { opacity: SpringValue, score: number }) => {
  return (
    <>
      <ScreenSpace depth={1}>
        <Billboard>
          <CustomText opacity={opacity} position={POSITION_HEADING} size={0.05} text={'SCORE'} color={'white'} outlineColor={0x333333}/>
          <CustomText opacity={opacity} position={POSITION_SCORE} size={0.1} text={`${score}`} color={0x333333} outlineColor={'black'}/>
        </Billboard>
      </ScreenSpace>
    </>
  )
}

export { Score }
