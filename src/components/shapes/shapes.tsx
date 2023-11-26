/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  Outlines,
  Decal,
  useTexture,
  Text3D,
  Bvh,
  useGLTF
} from "@react-three/drei";
import {useEffect, useRef, useState, ReactNode} from "react";
import {useSpring, animated, config, AnimationResult, SpringValue} from '@react-spring/three'
import * as THREE from "three";
import {useThree, ThreeEvent, useFrame} from "@react-three/fiber";
// import {Leva, useControls} from "leva";

type Shape = {
  name: string;
  renderFn: () => ReactNode
}

type ShapeSelectedEvent = {
  shapeIndex: number;
  shapeTextObject: THREE.Object3D;
}

const uiColor = "#555555";

const shapes: Shape[] = [
  { name: 'TORUS\n KNOT',    renderFn: () => <torusKnotGeometry args={[0.3, 0.13, 100, 16]}/> },
  { name: 'SPHERE',          renderFn: () => <sphereGeometry args={[0.5, 64, 32]}/> },
  { name: 'MODEL',           renderFn: () => <ModelGeometry /> },
  { name: 'BOX',             renderFn: () => <boxGeometry args={[0.75, 0.75, 0.75]}/> },
  { name: 'DODECA-\nHEDRON', renderFn: () => <dodecahedronGeometry args={[0.5]}/> },
  { name: 'CONE',            renderFn: () => <coneGeometry args={[0.5, 0.5, 62]} /> },
  { name: 'TORUS',           renderFn: () => <torusGeometry args={[0.3, 0.15]} /> },
  { name: 'CYLINDER',        renderFn: () => <cylinderGeometry args={[0.5, 0.5, 0.5]}/> },
]

const numRadsPerShape = (Math.PI * 2) / shapes.length;
const radius = 2.5;
const positionPerShape: THREE.Vector3[] = shapes.map((_shape, shapeIndex) => {
  const x = radius * Math.sin(shapeIndex * numRadsPerShape);
  const y = -0.70;
  const z = radius * Math.cos(shapeIndex * numRadsPerShape);
  return new THREE.Vector3(x, y, z);
})

useGLTF.preload('/r3f-demos/shapes/Suzanne.gltf')

const ModelGeometry = () => {
  const { scene } = useGLTF('/r3f-demos/shapes/Suzanne.gltf')
  const geometry = (scene.children[0] as THREE.Mesh).geometry.clone().scale(0.5, 0.5, 0.5).rotateY(Math.PI * 0.25)

  return <bufferGeometry attach="geometry" {...geometry} />
}

const Shape = ({ shape, opacity }: { shape: Shape, opacity: SpringValue }) => {
  const boxMesh = useRef<THREE.Mesh>(null!)
  const texture = useTexture('/r3f-demos/cross.png')
  const [hovered, hover] = useState(false)

  const INITIAL_ANIMATION = () => ({
    from: { scale: 0, rotateX: 0, rotateY: 0, rotateZ: 0, position: [0, 0.4, 0] },
    // @ts-ignore
    to: async (next)=> {
      await next({ scale: 3 })
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
    from: { scale: 3, rotateX: Math.PI, rotateY: Math.PI, rotateZ: Math.PI, position: [0, 0.5, 0] },
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
      {/* @ts-ignore */}
      <animated.meshStandardMaterial
        metalness={0.45}
        roughness={0.75}
        color={0x2176AE}
        transparent={true}
        opacity={opacity}
      />
      {shape.name === 'SPHERE' && <Decal mesh={boxMesh}>
          <animated.meshBasicMaterial map={texture} transparent={true} opacity={opacity} polygonOffset={true} polygonOffsetFactor={-1} />
      </Decal>}
      {hovered && <Outlines
          thickness={0.01}
          color="orange"
          angle={Math.PI}
          screenspace={false}
          opacity={1}
          transparent={false}
      />}
    </animated.mesh>
  </>
}

const CurvedText = ({ color, text, position, onClicked, opacity }: {
  color: THREE.Color,
  text: string,
  position: THREE.Vector3,
  onClicked: (event: ThreeEvent<MouseEvent>) => void,
  opacity: SpringValue
}) => {
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
    text3D.current.lookAt(new THREE.Vector3(0,0,0));
    // rotate to face outwards from center
    text3D.current.rotateOnAxis(new THREE.Vector3(0,1,0), Math.PI)
    // rotate to face 45 degrees upwards
    text3D.current.rotateOnAxis(new THREE.Vector3(1,0,0), -Math.PI * 0.5);
  }, [text3D])

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
      font="/shapes/Inter_Bold.json"
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
      <animated.meshStandardMaterial
        metalness={0.25}
        roughness={0.45}
        color={color}
        transparent={true}
        opacity={opacity}
      />
      <mesh position-z={-0.25} rotation-z={Math.PI*0.5} name={"curvedText"} castShadow={true} >
        <capsuleGeometry args={[0.3, 1, 4, 16]} />
        <animated.meshStandardMaterial
          metalness={0.45}
          roughness={0.75}
          color={uiColor}
          transparent={true}
          opacity={opacity}
        />
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

const ShapeSelector = ({ selectedShapeIndex, onSelected, opacity }: { selectedShapeIndex: number, onSelected: (event: ShapeSelectedEvent) => void, opacity: SpringValue }) => {
  // TODO auto-select shape when idle and text is facing the camera (use @react-corekit/use-idle to detect idle)
  return (
    <>
      {shapes.map((shape, shapeIndex) =>
        <CurvedText
          key={shape.name}
          color={new THREE.Color(shapeIndex === selectedShapeIndex ? "orange" : 0xBBBBBB)}
          text={shape.name}
          position={positionPerShape[shapeIndex]}
          onClicked={(event: ThreeEvent<MouseEvent>) => {
            onSelected({ shapeIndex, shapeTextObject: event.object })
          }}
          opacity={opacity}
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

const Shapes = ({ opacity }: { opacity: SpringValue }) => {
  const [selectedShapeIndex, setSelectedShapeIndex] = useState(0);
  const { camera, events } = useThree();
  const [{ rotationY }, api] = useSpring(() => ({
    from: { rotationY: 0 },
    config: config.wobbly,
    immediate: false
  }))
  const isTransitioning = opacity.isAnimating;

  // Reset selected shape if necessary when transitioning in/out
  if (isTransitioning && selectedShapeIndex !== 0) {
    setSelectedShapeIndex(0);
    api.start({ rotationY: 0, immediate: true })
  }

  useFrame(() => {
    // Ensure that the mouse events are also triggered when camera rotation changes and mouse does not move
    // @ts-ignore
    events.update()
  })

  const onShapeSelected = ({ shapeIndex, shapeTextObject }: ShapeSelectedEvent): void => {
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
      {/*<Leva />*/}
      <Bvh firstHitOnly>
        <animated.group rotation-y={rotationY}>
          <Shape shape={shapes[selectedShapeIndex]} opacity={opacity}/>
          <ShapeSelector selectedShapeIndex={selectedShapeIndex} onSelected={onShapeSelected} opacity={opacity}/>
        </animated.group>
      </Bvh>
    </>
  )
}

export { Shapes }