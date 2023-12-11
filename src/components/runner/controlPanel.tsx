/* eslint-disable @typescript-eslint/ban-ts-comment */
import {animated, SpringValue} from "@react-spring/three";
import {useRef} from "react";
import {Box} from "@react-three/drei";
import * as THREE from "three";
import {useFrame} from "@react-three/fiber";
import {PushButton} from "../pushButton/pushButton.tsx";

const SIZE = 0.75;
const BUTTON_POSITION = new THREE.Vector3(0, 0.38, 0);

const ControlPanel = ({ opacity, onButtonClicked }: { opacity: SpringValue, onButtonClicked: () => void }) => {
  const box = useRef<THREE.Mesh>(null!);

  useFrame(({ camera }) => {
    if (!box.current) return;

    // Move mesh to be flush with camera
    box.current.position.copy(camera.position);
    box.current.quaternion.copy(camera.quaternion);

    // Apply offset
    box.current.translateZ(-1);
    box.current.translateY(-1);
  });

  return (
    opacity.isAnimating ? <></> :
    <>
      <Box
        ref={box}
        args={[SIZE, SIZE, SIZE]}
      >
        { /* @ts-ignore */ }
        <animated.meshStandardMaterial
          metalness={0.45}
          roughness={0.75}
          color={0x333333}
          transparent={false}
          opacity={1}
        />
        <PushButton opacity={opacity} position={BUTTON_POSITION} scale={0.085} onHoveredChanged={() => {}} onButtonClicked={onButtonClicked} enabled={true} />
      </Box>
    </>
  )
}

export { ControlPanel }
