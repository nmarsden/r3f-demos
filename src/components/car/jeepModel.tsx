/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.13 public/car/jeep.glb -o src/components/car/jeepModel.tsx --transform -j --types 
Files: public/car/jeep.glb [230.19KB] > jeep-transformed.glb [95.42KB] (59%)
*/

import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { GLTF } from 'three-stdlib'

type GLTFResult = GLTF & {
  nodes: {
    Cube006_Cube001: THREE.Mesh
    Cylinder003: THREE.Mesh
    Circle003: THREE.Mesh
    Circle002: THREE.Mesh
    Cylinder002: THREE.Mesh
    Cube005_Cube008: THREE.Mesh
    Cube003_Cube006: THREE.Mesh
    Cube002_Cube005: THREE.Mesh
    Cube001_Cube004: THREE.Mesh
    Cylinder001: THREE.Mesh
    Circle001: THREE.Mesh
    ['Cube_Cube002-Mesh']: THREE.Mesh
    ['Cube_Cube002-Mesh_1']: THREE.Mesh
    ['Cube_Cube002-Mesh_2']: THREE.Mesh
    ['Cube_Cube002-Mesh_3']: THREE.Mesh
    Circle: THREE.Mesh
    Cylinder: THREE.Mesh
  }
  materials: {
    PaletteMaterial001: THREE.MeshStandardMaterial
  }
}

export function JeepModel(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF('/r3f-demos/car/jeep-transformed.glb') as GLTFResult
  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.Cube006_Cube001.geometry} material={materials.PaletteMaterial001} />
      <mesh geometry={nodes.Cylinder003.geometry} material={materials.PaletteMaterial001} />
      <mesh geometry={nodes.Circle003.geometry} material={materials.PaletteMaterial001} />
      <mesh geometry={nodes.Circle002.geometry} material={materials.PaletteMaterial001} />
      <mesh geometry={nodes.Cylinder002.geometry} material={materials.PaletteMaterial001} />
      <mesh geometry={nodes.Cube005_Cube008.geometry} material={materials.PaletteMaterial001} />
      <mesh geometry={nodes.Cube003_Cube006.geometry} material={materials.PaletteMaterial001} />
      <mesh geometry={nodes.Cube002_Cube005.geometry} material={materials.PaletteMaterial001} />
      <mesh geometry={nodes.Cube001_Cube004.geometry} material={materials.PaletteMaterial001} />
      <mesh geometry={nodes.Cylinder001.geometry} material={materials.PaletteMaterial001} />
      <mesh geometry={nodes.Circle001.geometry} material={materials.PaletteMaterial001} />
      <mesh geometry={nodes.Circle.geometry} material={materials.PaletteMaterial001} />
      <mesh geometry={nodes.Cylinder.geometry} material={materials.PaletteMaterial001} />
      <mesh geometry={nodes['Cube_Cube002-Mesh'].geometry} material={materials.PaletteMaterial001} />
      <mesh geometry={nodes['Cube_Cube002-Mesh_1'].geometry} material={materials.PaletteMaterial001} />
      <mesh geometry={nodes['Cube_Cube002-Mesh_2'].geometry} material={materials.PaletteMaterial001} />
      <mesh geometry={nodes['Cube_Cube002-Mesh_3'].geometry} material={materials.PaletteMaterial001} />
    </group>
  )
}

useGLTF.preload('/r3f-demos/car/jeep-transformed.glb')
