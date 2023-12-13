/* eslint-disable @typescript-eslint/ban-ts-comment */
import {animated, SpringValue} from "@react-spring/three";
import {useCallback, useEffect, useRef, useState} from "react";
import {Box, useCursor} from "@react-three/drei";
import * as THREE from "three";
import {useFrame} from "@react-three/fiber";
import {ButtonHoveredChangedEvent, PushButton} from "../pushButton/pushButton.tsx";

const SIZE = 0.75;
const BUTTON_POSITION = new THREE.Vector3(0, 0.38, 0);

const ControlPanel = ({ opacity, onButtonClicked }: { opacity: SpringValue, onButtonClicked: () => void }) => {
  const box = useRef<THREE.Mesh>(null!);
  const spotLight = useRef<THREE.SpotLight>(null!);
  const [hovered, setHovered] = useState(false);

  const onButtonHovered = useCallback((event: ButtonHoveredChangedEvent) => {
    setHovered(event.isHovered);
  }, []);

  useCursor(hovered);

  useFrame(({ camera }) => {
    if (!box.current) return;

    // Move mesh to be flush with camera
    box.current.position.copy(camera.position);
    box.current.quaternion.copy(camera.quaternion);

    // Apply offset
    box.current.translateZ(-1);
    box.current.translateY(-1);
  });

  useEffect(() => {
    if (!spotLight.current || !box.current) return;

    spotLight.current.target = box.current;

  }, [box.current, spotLight.current]);

  return (
    <>
      <Box
        ref={box}
        args={[SIZE, SIZE, SIZE]}
      >
        { /* @ts-ignore */ }
        <animated.meshStandardMaterial
          metalness={0.45}
          roughness={0.75}
          color={'black'}
          transparent={true}
          opacity={opacity}
        />
        <PushButton opacity={opacity} position={BUTTON_POSITION} scale={0.085} onHoveredChanged={onButtonHovered} onButtonClicked={onButtonClicked} enabled={true} />
        <spotLight ref={spotLight} angle={0.51} intensity={2} castShadow={true} position={[0, 1, 0]} />
      </Box>
    </>
  )
}

export { ControlPanel }
