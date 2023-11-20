/* eslint-disable @typescript-eslint/ban-ts-comment */
import './index.css'
import {createRoot} from 'react-dom/client'
import {Canvas, useFrame} from '@react-three/fiber'
import {Menu, Page} from "./components/menu/menu";
import {Floor} from "./components/floor/floor";
import {Home} from "./components/home/home";
import {Arm} from "./components/arm/arm";
import {Shapes} from "./components/shapes/shapes";
import {Paint} from "./components/paint/paint";
import {Boxes} from "./components/boxes/boxes";
import {Environment, Loader, OrbitControls} from "@react-three/drei";
import {useLocation, Route, Switch} from "wouter";
import {useTransition, animated, config} from "@react-spring/three";
// import {Test} from "./components/test/test";
import {RefObject, useEffect, useRef, useState} from "react";
import * as THREE from "three";
import {MainContext} from "./mainContext";
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

const pages: Page[] = [
  { name: 'Demos', path: '/', screenshot: '', renderFn: (props) => <Home {...props} /> },
  { name: 'Shapes', path: '/shapes', screenshot: '/screenshot/shapes.png', renderFn: (props) => <Shapes {...props} /> },
  { name: 'Arm', path: '/arm', screenshot: '/screenshot/arm.png', renderFn: (props) => <Arm {...props} /> },
  { name: 'Paint', path: '/paint', screenshot: '/screenshot/paint.png', renderFn: (props) => <Paint {...props} /> },
  { name: 'Boxes', path: '/boxes', screenshot: '/screenshot/boxes.png', renderFn: (props) => <Boxes {...props} /> },
  // { name: 'Test_A', path: '/test-a', renderFn: (props) => <Test text='TEST A' {...props} /> },
  // { name: 'Test_B', path: '/test-b', renderFn: (props) => <Test text='TEST B' {...props} /> }
];

const CAMERA_POSITION: THREE.Vector3 = new THREE.Vector3(0, 2, 7);

const CameraAnimation = ({ reset, controls }: { reset: boolean, controls: RefObject<OrbitControlsImpl> }) => {
  useFrame(state => {
    if (reset) {
      state.camera.position.lerp(CAMERA_POSITION, 0.05)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      controls.current.reset()
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

const App = () => {
  const container = useRef<HTMLDivElement>(null!);
  const controls = useRef<OrbitControlsImpl>(null!);
  const [isTransitioning, setIsTransitioning] = useState(false)

  const [location] = useLocation();
  const transition = useTransition(location, {
    from: { position: [0, 0, 0], rotation: [0, Math.PI, 0], scale: 0.01, opacity: 0 },
    enter: { position: [0, 0, 0], rotation: [0, 0, 0], scale: 1, opacity: 1 },
    leave: { position: [0, 0, 0], rotation: [0, -Math.PI, 0], scale: 0.01, opacity: 0 },
    config: config.molasses,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    onRest: () => {
      setIsTransitioning(false)
    }
  })

  useEffect(() => {
    setIsTransitioning(true)
  }, [location])

  useEffect(() => {
    // Set cursor
    document.body.style.cursor = isTransitioning ? 'wait' : 'auto'
    return () => {
      document.body.style.cursor = 'auto';
    }
  }, [isTransitioning])

  return (
    <>
      <Menu pages={pages}/>
      <div className="container" ref={container}>
        <Canvas
          shadows={true}
          camera={{ position: CAMERA_POSITION, fov: 70 }}
        >
          <MainContext.Provider value={{ controls: controls, pages: pages }} >
            <CameraAnimation reset={isTransitioning} controls={controls} />
            <Lights/>
            <Floor showCross={location === '/boxes'}/>
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
            <OrbitControls
              ref={controls}
              makeDefault={true}
              maxPolarAngle={Math.PI / 2}
              autoRotate={false}
              autoRotateSpeed={0.25}
              minDistance={3}
              maxDistance={10}
              enableZoom={!isTransitioning}
              enablePan={false}
              enableRotate={!isTransitioning}
            />
          </MainContext.Provider>
        </Canvas>
      </div>
      <Loader />
    </>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
