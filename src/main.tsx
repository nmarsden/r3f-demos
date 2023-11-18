import './index.css'
import {createRoot} from 'react-dom/client'
import {Canvas, useFrame} from '@react-three/fiber'
import {Menu, Page} from "./components/menu/menu";
import {Home} from "./components/home/home";
import {Arm} from "./components/arm/arm";
import {Shapes} from "./components/shapes/shapes";
import {Paint} from "./components/paint/paint";
import {Environment, Loader, OrbitControls} from "@react-three/drei";
import {useLocation, Route, Switch} from "wouter";
import {useTransition, animated, config} from "@react-spring/three";
// import {Test} from "./components/test/test";
import {RefObject, useEffect, useRef, useState} from "react";
import * as THREE from "three";
import {OrbitControlsContext} from "./context";
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

const pages: Page[ ] = [
  { name: 'Demos', path: '/', renderFn: (props) => <Home {...props} /> },
  { name: 'Shapes', path: '/shapes', renderFn: (props) => <Shapes {...props} /> },
  { name: 'Arm', path: '/arm', renderFn: (props) => <Arm {...props} /> },
  { name: 'Paint', path: '/paint', renderFn: (props) => <Paint {...props} /> },
  // { name: 'Test_A', path: '/test-a', renderFn: (props) => <Test text='TEST A' {...props} /> },
  // { name: 'Test_B', path: '/test-b', renderFn: (props) => <Test text='TEST B' {...props} /> }
];

const CameraAnimation = ({ reset, controls }: { reset: boolean, controls: RefObject<OrbitControlsImpl> }) => {
  const vec = new THREE.Vector3();

  useFrame(state => {
    if (reset) {
      state.camera.position.lerp(vec.set(0, 2, 4.5), 0.05)
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
          camera={{ position: [0, 2, 4.5], fov: 70 }}
        >
          <OrbitControlsContext.Provider value={{ controls: controls }}>
            <CameraAnimation reset={isTransitioning} controls={controls} />
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
          </OrbitControlsContext.Provider>
        </Canvas>
      </div>
      <Loader />
    </>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
