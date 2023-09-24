import {useFrame} from '@react-three/fiber'
import {useRef} from "react";
import {Mesh} from "three";

const Cube = () => {
  const meshRef = useRef<Mesh>(null!)

  useFrame(({ clock}) => {
    const t = clock.getElapsedTime();
    const factor = 0.75;
    meshRef.current.position.x = Math.sin(t * factor * Math.PI) * 3
    meshRef.current.position.y = Math.cos(t * factor * Math.PI) * 3
    meshRef.current.position.z = Math.sin(t * factor * Math.PI) * 3
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  )
}

export { Cube }