import './index.css'
import {createRoot} from 'react-dom/client'
import {Canvas, useFrame} from '@react-three/fiber'
import {Menu, Page} from "./components/menu/menu";
import {Home} from "./components/home/home";
import {Hand} from "./components/hand/hand";
import {Shapes} from "./components/shapes/shapes";
import {Environment, Loader} from "@react-three/drei";
import {useLocation, Route, Switch} from "wouter";
import {useTransition, animated, config} from "@react-spring/three";
// import {Test} from "./components/test/test";
import {useEffect, useRef, useState} from "react";
import * as THREE from "three";

const pages: Page[ ] = [
  { name: 'Home', path: '/', renderFn: (props) => <Home {...props} /> },
  { name: 'Shapes', path: '/shapes', renderFn: (props) => <Shapes {...props} /> },
  { name: 'Hand', path: '/hand', renderFn: (props) => <Hand {...props} /> },
  // { name: 'Test_A', path: '/test-a', renderFn: (props) => <Test text='TEST A' {...props} /> },
  // { name: 'Test_B', path: '/test-b', renderFn: (props) => <Test text='TEST B' {...props} /> }
];

const CameraAnimation = ({ reset }: { reset: boolean }) => {
  const vec = new THREE.Vector3();

  useFrame(state => {
    if (reset) {
      state.camera.position.lerp(vec.set(0, 2, 4.5), 0.05)
    } return null
  })
  return null;
}

const Lights = () => {
  const spotLight = useRef<THREE.SpotLight>(null!);
  return <>
    <ambientLight intensity={0.25} />
    <spotLight ref={spotLight} angle={0.51} intensity={100} castShadow={true} position={[0, 10, 0]} />
  </>
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const Floor = ({ position }) => {
  return <animated.mesh position={position} rotation={[-Math.PI / 2, 0, 0]} receiveShadow={true}>
    <planeGeometry args={[1000,1000]}/>
    <shadowMaterial color={0x666666}/>
  </animated.mesh>
}

const App = () => {
  const container = useRef<HTMLDivElement>(null!);
  const [resetCamera, setResetCamera] = useState(false)

  const [location] = useLocation();
  const transition = useTransition(location, {
    from: { position: [0, 0, 0], rotation: [0, Math.PI, 0], scale: [0, 0, 0], opacity: 0 },
    enter: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], opacity: 1 },
    leave: { position: [0, 0, 0], rotation: [0, -Math.PI, 0], scale: [0, 0, 0], opacity: 0 },
    config: config.molasses
  })

  useEffect(() => {
    const onPointerUp = () => { setResetCamera(true) }
    const onPointerDown = () => { setResetCamera(false) }

    container.current.addEventListener('pointerup', onPointerUp)
    container.current.addEventListener('pointerdown', onPointerDown)

    return () => {
      container.current.removeEventListener('pointerup', onPointerUp)
      container.current.removeEventListener('pointerdown', onPointerDown)
    }
  }, [])

  return (
    <>
      <Menu pages={pages}/>
      <div className="container" ref={container}>
        <Canvas
          shadows={true}
          camera={{ position: [0, 2, 4.5], fov: 70 }}
        >
          <CameraAnimation reset={resetCamera}/>
          <Lights/>
          <Floor position={[0, -1.3, 0]}/>

          { transition(({ position, rotation, scale, opacity }, location) => (
            <animated.group
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              position={position}
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              rotation={rotation}
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              scale={scale}
            >
              <Switch location={location}>
                {pages.map(page => <Route key={page.name} path={page.path}>
                  {page.renderFn({ opacity })}
                </Route>)}
              </Switch>
            </animated.group>
          )) }
          <Environment preset={'warehouse'} background blur={1}/>
        </Canvas>
      </div>
      <Loader />
    </>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
