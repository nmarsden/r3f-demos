/* eslint-disable @typescript-eslint/ban-ts-comment */
import {animated, SpringValue} from "@react-spring/three";
import {Center, Html, Text3D} from "@react-three/drei";
import './home.css';
import {useTransitionState} from "../../hooks/transitionState.ts";

const uiColor = 0x2176AE;

const DemoHeading = ({ opacity }: { opacity: SpringValue }) => {
  const transitionState = useTransitionState(opacity);
  return <>
    <Html
      center={true}
      transform={true}
      scale={0.5}
      occlude={false}
      position-y={2}
      zIndexRange={[50, 40]}
    >
      <div className={`demo-heading ${transitionState === 'ENTERING' ? 'fade-in': ''} ${transitionState === 'LEAVING' ? 'fade-out': ''}`}>
        <div>REACT THREE FIBRE</div>
      </div>
    </Html>
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
        font="/r3f-demos/shapes/Inter_Bold.json"
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