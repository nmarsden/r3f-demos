/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.13 public/trophy/trophy_clash_royale.glb -o trophyModel.tsx --transform -j --types
Files: public/trophy/trophy_clash_royale.glb [1.05MB] > trophy_clash_royale-transformed.glb [95.95KB] (91%)
Author: Arun Kumar S (https://sketchfab.com/arun-kumar)
License: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
Source: https://sketchfab.com/3d-models/trophy-clash-royale-57ec3bc84cc74f5a85da07b99f4c770a
Title: Trophy (Clash Royale)
*/

import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { GLTF } from 'three-stdlib'
import {animated, config, useSpring} from "@react-spring/three";
import {useEffect} from "react";

type GLTFResult = GLTF & {
  nodes: {
    Object_2: THREE.Mesh
  }
  materials: {
    Trophy_Gold: THREE.MeshStandardMaterial
  }
}

export function TrophyModel(props: JSX.IntrinsicElements['group']) {
  const [{ positionZ, rotationZ }, api] = useSpring(() => ({
    from: { positionZ: -1, rotationZ: 0 },
    config: config.molasses
  }))

  useEffect(() => {
    api.start({
      to: [
        { positionZ: 1.55, rotationZ: Math.PI * 2 },
        { rotationZ: Math.PI * 2, loop: true }
      ]
    })
  }, []);

  const { nodes, materials } = useGLTF('/r3f-demos/trophy/trophy_clash_royale-transformed.glb') as GLTFResult
  return (
    <group {...props} dispose={null}>
      <animated.mesh
        geometry={nodes.Object_2.geometry}
        material={materials.Trophy_Gold}
        position-y={2}
        position-z={positionZ}
        rotation-x={-Math.PI}
        rotation-z={rotationZ}
      />
    </group>
  )
}

useGLTF.preload('/r3f-demos/trophy/trophy_clash_royale-transformed.glb')
