/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.13 public/hand/robohand-2.glb -o robohand2Model.tsx --transform -j --types 
Files: public/hand/robohand-2.glb [68.43MB] > robohand-2-transformed.glb [2.57MB] (96%)
*/

import * as THREE from 'three'
import {useGLTF} from '@react-three/drei'
import {GLTF} from 'three-stdlib'
import {useEffect, useMemo, useState} from "react";
import {animated, config, SpringValue, useSprings} from '@react-spring/three'

type GLTFResult = GLTF & {
  nodes: {
    Object_10: THREE.Mesh
    Object_10001: THREE.Mesh
    Object_10002: THREE.Mesh
    Object_11: THREE.Mesh
    Object_12: THREE.Mesh
    Object_13: THREE.Mesh
    Object_14: THREE.Mesh
    Object_15: THREE.Mesh
    Object_16: THREE.Mesh
    Object_16001: THREE.Mesh
    Object_17: THREE.Mesh
    Object_2001: THREE.Mesh
    Object_3: THREE.Mesh
    Object_4: THREE.Mesh
    Object_4001: THREE.Mesh
    Object_4002: THREE.Mesh
    Object_4003: THREE.Mesh
    Object_4004: THREE.Mesh
    Object_5: THREE.Mesh
    Object_6: THREE.Mesh
    Object_7: THREE.Mesh
    Object_8: THREE.Mesh
    Object_9: THREE.Mesh
  }
  materials: {
    Default: THREE.MeshStandardMaterial
  }
}

type Positions = { position: number[], displacement: number[] };

export function Robohand2Model({ opacity, ...props}: JSX.IntrinsicElements['group'] & { opacity: SpringValue }) {
  const [hovered, hover] = useState(false);
  const [exploded, setExploded] = useState(false);
  const { nodes, materials } = useGLTF('/hand/robohand-2-transformed.glb') as GLTFResult
  const isTransitioning = opacity.isAnimating;

  // Reset exploded if necessary when transitioning in/out
  if (isTransitioning && exploded) {
    setExploded(false);
  }

  const { targetMap, positions } = useMemo(
    () => {
      const targetMap: Map<string, Positions> = new Map<string, Positions>();
      const explosionCenter = new THREE.Vector3(0, 0, 0);
      const explosionFactor = 0.5;

      Object.keys(nodes).forEach(nodeKey => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const mesh: THREE.Mesh = nodes[nodeKey];
        if (mesh.name.startsWith('Object')) {

          const position: THREE.Vector3 = mesh.position;

          const vector = position.clone().sub(explosionCenter).normalize();
          const displacement = position.clone().add(
            vector.multiplyScalar(
              position.distanceTo(explosionCenter) * explosionFactor
            )
          );
          targetMap.set(mesh.name, { position: [ position.x, position.y, position.z ], displacement: [ displacement.x, displacement.y, displacement.z ] } );
        }
      })
      const positions: Positions[] = Array.from(targetMap.values());

      return { targetMap, positions };
    },
    []
  );

  const [springs, api] = useSprings(
    targetMap.size,
    (index) => ({
      from: {
        position: positions[index].position
      },
      position: positions[index].position,
      config: config.stiff
    })
  );

  useEffect(() => {
    api.start(index => ({
      position: exploded ? positions[index].displacement : positions[index].position,
    }))
  }, [exploded]);

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto'
    return () => {
      document.body.style.cursor = 'auto';
    }
  }, [hovered])

  return (
    <group {...props}
           dispose={null}
           onPointerOver={() => hover(true)}
           onPointerOut={() => hover(false)}
           onClick={(event) => {
             setExploded(!exploded);
             event.stopPropagation();
           }}
    >
      {
        [...targetMap.keys()].map((meshName, index) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const mesh: THREE.Mesh = nodes[meshName];
          return <animated.mesh
            key={meshName}
            geometry={mesh.geometry}
            castShadow={true}
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            position={springs[index].position}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
            {/* @ts-ignore */}
            <animated.meshStandardMaterial
              {...materials.Default}
              transparent={true}
              opacity={opacity}
            />
          </animated.mesh>
        })
      }

      {/*<mesh geometry={nodes.Object_10.geometry} material={materials.Default} position={[-0.232, 4.245, -9.919]} rotation={[-Math.PI / 2, 0, 0]} />*/}
      {/*<mesh geometry={nodes.Object_10001.geometry} material={materials.Default} position={[0.008, 0.659, 17.986]} rotation={[-Math.PI / 2, 0, 0]} />*/}
      {/*<mesh geometry={nodes.Object_10002.geometry} material={materials.Default} position={[0.006, -0.016, -14.494]} rotation={[-Math.PI / 2, 0, 0]} />*/}
      {/*<mesh geometry={nodes.Object_11.geometry} material={materials.Default} position={[0.007, 0.829, 15.737]} rotation={[-Math.PI / 2, 0, 0]} />*/}
      {/*<mesh geometry={nodes.Object_12.geometry} material={materials.Default} position={[-3.889, -0.242, 14.976]} rotation={[-Math.PI / 2, 0, 0]} />*/}
      {/*<mesh geometry={nodes.Object_13.geometry} material={materials.Default} position={[-3.986, -0.242, 12.717]} rotation={[-Math.PI / 2, 0, 0]} />*/}
      {/*<mesh geometry={nodes.Object_14.geometry} material={materials.Default} position={[-3.332, -0.242, 11.356]} rotation={[-Math.PI / 2, 0, 0]} />*/}
      {/*<mesh geometry={nodes.Object_15.geometry} material={materials.Default} position={[2.64, -3.161, -8.588]} rotation={[-Math.PI / 2, 0, 0]} />*/}
      {/*<mesh geometry={nodes.Object_16.geometry} material={materials.Default} position={[2.814, 3.225, -8.523]} rotation={[-Math.PI / 2, 0, 0]} />*/}
      {/*<mesh geometry={nodes.Object_16001.geometry} material={materials.Default} position={[-1.412, 0.708, 14.166]} rotation={[-Math.PI / 2, 0, 0]} />*/}
      {/*<mesh geometry={nodes.Object_17.geometry} material={materials.Default} position={[-3.845, 1.336, -8.587]} rotation={[-Math.PI / 2, 0, 0]} />*/}
      {/*<mesh geometry={nodes.Object_2001.geometry} material={materials.Default} position={[0.007, 0.708, 14.166]} rotation={[-Math.PI / 2, 0, 0]} />*/}
      {/*<mesh geometry={nodes.Object_3.geometry} material={materials.Default} position={[-0.098, -0.086, 0.359]} rotation={[-Math.PI / 2, 0, 0]} />*/}
      {/*<mesh geometry={nodes.Object_4.geometry} material={materials.Default} position={[-1.51, -2.07, -4.618]} rotation={[-Math.PI / 2, 0, 0]} />*/}
      {/*<mesh geometry={nodes.Object_4001.geometry} material={materials.Default} position={[-1.412, 0.659, 17.986]} rotation={[-Math.PI / 2, 0, 0]} />*/}
      {/*<mesh geometry={nodes.Object_4002.geometry} material={materials.Default} position={[0.007, -0.036, 6.432]} rotation={[-Math.PI / 2, 0, 0]} />*/}
      {/*<mesh geometry={nodes.Object_4003.geometry} material={materials.Default} position={[0.104, 2.511, 4.416]} rotation={[-Math.PI / 2, 0, 0]} />*/}
      {/*<mesh geometry={nodes.Object_4004.geometry} material={materials.Default} position={[-5.099, 0.369, -0.006]} rotation={[-Math.PI / 2, 0, 0]} />*/}
      {/*<mesh geometry={nodes.Object_5.geometry} material={materials.Default} position={[-0.255, 0.426, 10.505]} rotation={[-Math.PI / 2, 0, 0]} />*/}
      {/*<mesh geometry={nodes.Object_6.geometry} material={materials.Default} position={[-1.412, 0.829, 15.737]} rotation={[-Math.PI / 2, 0, 0]} />*/}
      {/*<mesh geometry={nodes.Object_7.geometry} material={materials.Default} position={[1.427, 0.708, 14.166]} rotation={[-Math.PI / 2, 0, 0]} />*/}
      {/*<mesh geometry={nodes.Object_8.geometry} material={materials.Default} position={[1.427, 0.829, 15.737]} rotation={[-Math.PI / 2, 0, 0]} />*/}
      {/*<mesh geometry={nodes.Object_9.geometry} material={materials.Default} position={[1.427, 0.659, 17.986]} rotation={[-Math.PI / 2, 0, 0]} />*/}
    </group>
  )
}

useGLTF.preload('/hand/robohand-2-transformed.glb')
