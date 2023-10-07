/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  OrbitControls,
  Environment,
  Outlines,
  Decal,
  useTexture,
  Billboard,
  Text3D,
  Center,
  Bvh,
  useGLTF
} from "@react-three/drei";
import {useEffect, useRef, useState, ReactNode} from "react";
import {useSpring, animated, config, AnimationResult} from '@react-spring/three'
import * as THREE from "three";
import {useThree, ThreeEvent} from "@react-three/fiber";
import {OrbitControls as OrbitControlsRef} from 'three-stdlib'

type Shape = {
  name: string;
  renderFn: () => ReactNode
}

const shapes: Shape[] = [
  { name: 'SPHERE',       renderFn: () => <sphereGeometry args={[0.5, 64, 32]}/> },
  { name: 'MODEL',        renderFn: () => <ModelGeometry /> },
  { name: 'BOX',          renderFn: () => <boxGeometry args={[0.75, 0.75, 0.75]}/> },
  { name: 'DODECA-\nHEDRON', renderFn: () => <dodecahedronGeometry args={[0.5]}/> },
  { name: 'CONE',         renderFn: () => <coneGeometry args={[0.5]} /> },
  { name: 'TORUS',        renderFn: () => <torusGeometry args={[0.4, 0.1]} /> },
  { name: 'CYLINDER',     renderFn: () => <cylinderGeometry args={[0.5, 0.5, 0.5]}/> },
  { name: 'TORUS\n KNOT',   renderFn: () => <torusKnotGeometry args={[0.3, 0.13, 100, 16]}/> },
]

useGLTF.preload('/Suzanne.gltf')

const ModelGeometry = () => {
  const { scene } = useGLTF('/Suzanne.gltf')
  const geometry = (scene.children[0] as THREE.Mesh).geometry.clone().scale(0.5, 0.5, 0.5).rotateY(Math.PI * 0.25)

  return <bufferGeometry attach="geometry" {...geometry} />
}

const Lights = () => {
  const spotLight = useRef<THREE.SpotLight>(null!);
  return <>
    <ambientLight intensity={0.25} />
    <spotLight ref={spotLight} angle={0.25} intensity={100} castShadow={true} position={[0, 10, 0]} />
  </>
}

const Heading = () => {
  return <Billboard
    follow={true}
    lockX={false}
    lockY={false}
    lockZ={false} // Lock the rotation on the z axis (default=false)
  >
    <Center position={[0, 4.5, -3]}>
      <Text3D
        curveSegments={32}
        bevelEnabled
        bevelSize={0.04}
        bevelThickness={0.1}
        height={0.5}
        lineHeight={0.5}
        letterSpacing={-0.06}
        size={0.75}
        font="/Inter_Bold.json"
      >
        {"SHAPES"}
        <meshStandardMaterial color="white" />
      </Text3D>
    </Center>
  </Billboard>
}

// @ts-ignore
const Shape = ({ shape }) => {
  const boxMesh = useRef<THREE.Mesh>(null!)
  const texture = useTexture('/cross.png')
  const [hovered, hover] = useState(false)

  const INITIAL_ANIMATION = () => ({
    from: { scale: 0, rotateX: 0, rotateY: 0, rotateZ: 0, position: [0, 0, 0] },
    // @ts-ignore
    to: async (next)=> {
      await next({ scale: 2 })
      await next({ rotateX: Math.PI })
      await next({ rotateY: Math.PI })
      await next({ rotateZ: Math.PI })
      await next({ position: [0, 0.5, 0] })
    },
    onRest: (result: AnimationResult) => {
      if (result.finished) {
        api.start(FLOATING_ANIMATION)
      }
    },
    config: config.wobbly
  })

  const FLOATING_ANIMATION = () => ({
    from: { scale: 2, rotateX: Math.PI, rotateY: Math.PI, rotateZ: Math.PI, position: [0, 0.5, 0] },
    to: [
      { rotateX: Math.PI*0.75 },
      { position: [0, 1, 0] },
      { rotateX: Math.PI },
      { position: [0, 0.5, 0] }
    ],
    loop: true,
    config: {
      duration: 4000
    }
  })

  const [{ scale, rotateX, rotateY, rotateZ, position }, api] = useSpring(INITIAL_ANIMATION)

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto'
    return () => {
      document.body.style.cursor = 'auto';
    }
  }, [hovered])

  useEffect(() => {
    api.start(INITIAL_ANIMATION)
  }, [shape])

  return <>
    <animated.mesh
      ref={boxMesh}
      castShadow={true}
      receiveShadow={true}
      scale={scale}
      // @ts-ignore
      rotation-x={rotateX}
      // @ts-ignore
      rotation-y={rotateY}
      // @ts-ignore
      rotation-z={rotateZ}
      // @ts-ignore
      position={position}
      onClick={() => api.start(INITIAL_ANIMATION)}
      onPointerOver={() => hover(true)}
      onPointerOut={() => hover(false)}
    >
      {shape.renderFn()}
      <meshStandardMaterial color="white" />
      {shape.name === 'SPHERE' && <Decal map={texture} />}
      {hovered && <Outlines
          thickness={0.05}
          color="orange"
          angle={Math.PI}
          screenspace={false}
          opacity={1}
          transparent={false}
      />}
    </animated.mesh>
    <mesh position={[0, -1.2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow={true}>
      <planeGeometry args={[10,10]}/>
      <shadowMaterial opacity={1} />
    </mesh>
  </>
}

// @ts-ignore
const CurvedText = ({ color, text, position, onClicked }) => {
  const [hovered, hover] = useState(false)
  const text3D = useRef<THREE.Mesh>(null!)

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto'
    return () => {
      document.body.style.cursor = 'auto';
    }
  }, [hovered])

  useEffect(() => {
    // center the vertices of the text geometry
    text3D.current.geometry.center();
    // rotate to face the center
    text3D.current.lookAt(new THREE.Vector3(0,position.y,0));
    // rotate to face outwards from center
    text3D.current.rotateOnAxis(new THREE.Vector3(0,1,0), Math.PI)
    // rotate to face 45 degrees upwards
    text3D.current.rotateOnAxis(new THREE.Vector3(1,0,0), -Math.PI * 0.25);
  }, [])

  return <>
    <Text3D
      ref={text3D}
      name={"curvedText"}
      castShadow={true}
      curveSegments={20}
      bevelEnabled
      bevelSize={0.02}
      bevelThickness={0.01}
      height={0.125}
      lineHeight={0.75}
      letterSpacing={0.02}
      size={0.15}
      font="/Inter_Bold.json"
      onClick={(event: ThreeEvent<MouseEvent>) => {
        if (event.object.name === 'curvedText') {
          onClicked(event)
        }
      }}
      onPointerOver={() => hover(true) }
      onPointerOut={() => hover(false) }
      position={position}
    >
      {text}
      <meshStandardMaterial color={color} />
      <mesh position-z={-0.25} rotation-z={Math.PI*0.5} name={"curvedText"} castShadow={true} >
        <capsuleGeometry args={[0.3, 1, 4, 16]} />
        <meshStandardMaterial color={0xCCCCCC} />
        {hovered && (
          <Outlines
            thickness={0.02}
            color="orange"
            angle={Math.PI}
            screenspace={false}
            opacity={1}
            transparent={false}
          />
        )}
      </mesh>
    </Text3D>
  </>
}

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ShapeSelector = ({ selectedShapeIndex, onSelected }) => {
  // TODO auto-select shape when idle and text is facing the camera (use @react-corekit/use-idle to detect idle)
  const numRadsPerShape = (Math.PI * 2) / shapes.length;
  const radius = 2.5;
  const positionPerShape: THREE.Vector3[] = shapes.map((_shape, shapeIndex) => {
    const x = radius * Math.sin(shapeIndex * numRadsPerShape);
    const y = -0.70;
    const z = radius * Math.cos(shapeIndex * numRadsPerShape);
    return new THREE.Vector3(x, y, z);
  })

  return (
    <>
      {shapes.map((shape, shapeIndex) =>
        <CurvedText
          key={shape.name}
          color={shapeIndex === selectedShapeIndex ? "orange" : "white"}
          text={shape.name}
          position={positionPerShape[shapeIndex]}
          onClicked={(event: ThreeEvent<MouseEvent>) => {
            onSelected({ shapeIndex, shapeTextObject: event.object })
          }}
        />
      )}
    </>
  )
}

const normalizedPositionOnXZPlane = (object: THREE.Object3D): THREE.Vector3 => {
  const v = new THREE.Vector3(0,0,0);
  object.getWorldPosition(v);
  v.setY(0);
  v.normalize();
  return v;
};

const angleBetween = (camera: THREE.Camera, object: THREE.Object3D): number => {
  const camPos = normalizedPositionOnXZPlane(camera);
  const objectPos = normalizedPositionOnXZPlane(object);

  return Math.acos(camPos.dot(objectPos));
};

const isRotateClockwise = (camera: THREE.Camera, object: THREE.Object3D): boolean => {
  const camPos = normalizedPositionOnXZPlane(camera);
  const objectPos = normalizedPositionOnXZPlane(object);

  const crossProduct = new THREE.Vector3(0,0,0);
  crossProduct.crossVectors(camPos, objectPos);
  const yAxis = new THREE.Vector3(0,1,0);

  return (crossProduct.dot(yAxis) > 0);
};

const Shapes = () => {
  const [selectedShapeIndex, setSelectedShapeIndex] = useState(0);
  const orbitControls = useRef<OrbitControlsRef>(null!)
  const camera = useThree((state) => state.camera)
  const [{ rotationY }, api] = useSpring(() => ({
    from: { rotationY: 0 },
    config: config.wobbly,
    immediate: false
  }))

  // @ts-ignore
  const onShapeSelected = ({ shapeIndex, shapeTextObject }) => {
    // Animate rotationY so that shape text is aligned with the camera
    const theta = angleBetween(camera, shapeTextObject);
    const isRotateClockWise = isRotateClockwise(camera, shapeTextObject);
    const rotationYDiff = isRotateClockWise ? -theta : theta;

    api.start({ rotationY: rotationY.get() + rotationYDiff });

    // Display selected shape
    setSelectedShapeIndex(shapeIndex);
  }

  return (
    <>
      <Bvh firstHitOnly>
        <Lights />
        <Heading />
        <animated.group rotation-y={rotationY}>
          <Shape shape={shapes[selectedShapeIndex]} />
          <ShapeSelector selectedShapeIndex={selectedShapeIndex} onSelected={onShapeSelected}/>
        </animated.group>
        <Environment preset={'sunset'} background blur={1}/>
        <OrbitControls
          ref={orbitControls}
          makeDefault={true}
          maxPolarAngle={Math.PI / 2}
          autoRotate={false}
          autoRotateSpeed={0.25}
          enableZoom={false}
        />
      </Bvh>
    </>
  )
}

export { Shapes }