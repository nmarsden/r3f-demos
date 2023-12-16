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
import {Maze} from "./components/maze/maze.tsx";
import {RollNJump} from "./components/roll-n-jump/roll-n-jump.tsx";
import {About} from "./components/about/about.tsx";
import {Environment, Loader, OrbitControls} from "@react-three/drei";
import {Route, Switch, Router} from "wouter";
import {useTransition, animated, config} from "@react-spring/three";
import {RefObject, useEffect, useRef, useState} from "react";
import * as THREE from "three";
import {MainContext} from "./mainContext";
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import {useHashLocation} from "./hooks/hashLocation.ts";
import {suspend } from 'suspend-react'
// @ts-ignore
const warehouse = import('@pmndrs/assets/hdri/warehouse.exr').then((module) => module.default)

const pages: Page[] = [
  { name: 'Demos', path: '/', screenshot: '', renderFn: (props) => <Home {...props} /> },
  { name: 'Shapes', path: '/shapes', screenshot: '/r3f-demos/home/shapes.png', renderFn: (props) => <Shapes {...props} /> },
  { name: 'Arm', path: '/arm', screenshot: '/r3f-demos/home/arm.png', renderFn: (props) => <Arm {...props} /> },
  { name: 'Paint', path: '/paint', screenshot: '/r3f-demos/home/paint.png', renderFn: (props) => <Paint {...props} /> },
  { name: 'Boxes', path: '/boxes', screenshot: '/r3f-demos/home/boxes.png', renderFn: (props) => <Boxes {...props} /> },
  { name: 'Maze', path: '/maze', screenshot: '/r3f-demos/home/maze.png', renderFn: (props) => <Maze {...props} />, cameraPosition: new THREE.Vector3(0, 8, 0) },
  { name: "Roll-n-Jump", path: '/roll-n-jump', screenshot: '/r3f-demos/home/roll-n-jump.png', renderFn: (props) => <RollNJump {...props} />, cameraPosition: new THREE.Vector3(0, 2, 16) },
  // { name: 'Test_A', path: '/test-a', screenshot: '', renderFn: (props) => <Test text='TEST A' {...props} /> },
  // { name: 'Test_B', path: '/test-b', screenshot: '', renderFn: (props) => <Test text='TEST B' {...props} /> },
  { name: 'About', path: '/about', screenshot: '', renderFn: (props) => <About {...props} /> },
];

const CAMERA_POSITION: THREE.Vector3 = new THREE.Vector3(0, 2, 7);

const CameraAnimation = ({ reset, cameraPosition, controls }: { reset: boolean, cameraPosition: THREE.Vector3, controls: RefObject<OrbitControlsImpl> }) => {
  useFrame(state => {
    if (reset) {
      state.camera.position.lerp(cameraPosition, 0.05)

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (controls.current) {
        controls.current.target.setX(0);
        controls.current.target.setY(0);
        controls.current.target.setZ(0);
        controls.current.update();
      }
    } return null
  })
  return null;
}

const Lights = () => {
  const spotLight = useRef<THREE.SpotLight>(null!);
  return <>
    <ambientLight intensity={1} />
    <spotLight ref={spotLight} angle={0.51} intensity={100} castShadow={true} position={[0, 10, 0]} />
  </>
}

// TODO create a demo of a small rube goldberg machine using rapier physics
const App = () => {
  const container = useRef<HTMLDivElement>(null!);
  const controls = useRef<OrbitControlsImpl>(null!);
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [cameraPosition, setCameraPosition] = useState(CAMERA_POSITION);

  const [location] = useHashLocation();
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

    // Set camera position for page
    const currentPage = pages.find(page => page.path === location) as Page;
    const cameraPosition: THREE.Vector3 = typeof currentPage.cameraPosition !== 'undefined' ? currentPage.cameraPosition : CAMERA_POSITION;
    setCameraPosition(cameraPosition);
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
          camera={{ position: cameraPosition, fov: 70 }}
        >
          <MainContext.Provider value={{ controls: controls, pages: pages }} >
            <CameraAnimation reset={isTransitioning} cameraPosition={cameraPosition} controls={controls} />
            {location !== '/roll-n-jump' ? <Lights/> : null}
            <Floor showCross={location === '/boxes'} enabled={location !== '/roll-n-jump'}/>
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
                { /* @ts-ignore */ }
                <Router hook={useHashLocation}>
                  <Switch location={location as string}>
                    {pages.map(page => <Route key={page.name} path={page.path}>
                      {page.renderFn({ opacity })}
                    </Route>)}
                  </Switch>
                </Router>
              </animated.group>
            )) }
            { /* @ts-ignore */ }
            <Environment files={suspend(warehouse)}/>
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
