/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as THREE from "three";
import {animated, SpringValue} from "@react-spring/three";
import {
  Box,
  Html,
  RoundedBox,
  useTexture
} from "@react-three/drei";
import {ReactNode, Suspense, useEffect} from "react";
import {Physics, RigidBody} from "@react-three/rapier";
import './about.css';

const uiColor = 0x2176AE;

const InfoBox = ({ opacity, color, position, rotationX, height, children }: { opacity: SpringValue, color: number, position: THREE.Vector3, rotationX: number, height: number, children: ReactNode }) => {
  return (
    <RoundedBox
      position={position}
      rotation-x={rotationX}
      args={[3, height, 0.5]}
      radius={0.2}
      smoothness={4}
      bevelSegments={4}
      creaseAngle={0.4}
      castShadow={true}
      receiveShadow={true}
    >
      {/* @ts-ignore */}
      <animated.meshStandardMaterial
        metalness={0.45}
        roughness={0.75}
        color={color}
        transparent={true}
        opacity={opacity}
      />
      <Html center={true} transform={true} scale={0.5} occlude={true} position-z={0.5 * 0.5 + 0.01}>
        <div className={'info'}>
          {children}
        </div>
      </Html>
      <Html center={true} transform={true} scale={-0.5} occlude={true} position-z={-0.5 * 0.5 - 0.01} rotation-y={Math.PI}>
        <div className={'info'}>
          {children}
        </div>
      </Html>
    </RoundedBox>
  )
};

const Info = ({ opacity, color, position, rotationX, height, children }: { opacity: SpringValue, color: number, position: THREE.Vector3, rotationX: number, height: number, children: ReactNode }) => {
  return (
    <>
      {opacity.isAnimating ? (
        <InfoBox opacity={opacity} color={color} position={position} rotationX={rotationX} height={height}>
          {children}
        </InfoBox>
      ) : (
        <RigidBody type={'dynamic'} colliders={'cuboid'} gravityScale={1}>
          <InfoBox opacity={opacity} color={color} position={position} rotationX={rotationX} height={height}>
            {children}
          </InfoBox>
        </RigidBody>
      )}
    </>
  );
}

const Ramp = ({ opacity, position }: { opacity: SpringValue, position: THREE.Vector3 }) => {
  const textureProps = useTexture({
    map: '/about/grid.jpg',
  })
  useEffect(() => {
    textureProps.map.repeat.setX(0.3)
    textureProps.map.repeat.setY(0.7)
  }, [textureProps.map]);

  return (
    <Box
      position={position}
      rotation-x={Math.PI * 0.2}
      args={[6, 0.5, 8]}
      castShadow={true}
      receiveShadow={true}
    >
      {/* @ts-ignore */}
      <animated.meshStandardMaterial
        metalness={0.45}
        roughness={0.75}
        color={'white'}
        transparent={true}
        opacity={opacity}
      />
      <animated.mesh position-y={0.3} rotation-x={Math.PI * -0.5} receiveShadow={true}>
        <planeGeometry args={[6,8]} />
        {/* @ts-ignore */}
        {/*<animated.shadowMaterial opacity={0.5} color={0x000000}/>*/}
        <animated.meshStandardMaterial
          {... textureProps}
          metalness={0.45}
          roughness={0.75}
          color={'white'}
          emissive={uiColor}
          transparent={true}
          opacity={opacity}
        />
      </animated.mesh>
      <Box
        position={[0,0.5,3.75]}
        args={[6, 0.5, 0.5]}
        castShadow={true}
        receiveShadow={true}
      >
        {/* @ts-ignore */}
        <animated.meshStandardMaterial
          metalness={0.45}
          roughness={0.75}
          color={'white'}
          transparent={true}
          opacity={opacity}
        />
      </Box>
    </Box>
  )
};

const RampAnim = ({ opacity, position }: { opacity: SpringValue, position: THREE.Vector3 }) => {
  return (
    <>
      {opacity.isAnimating ? (
        <Ramp opacity={opacity} position={position} />
      ) : (
        <RigidBody type={'fixed'} colliders={'cuboid'}>
          <Ramp opacity={opacity} position={position} />
        </RigidBody>
      )}
    </>
  );
}

type InfoType = {
  position: THREE.Vector3;
  rotationX?: number;
  content: ReactNode;
  height?: number;
  color?: number
};

const INFOS: InfoType[] = [
  {
    position: new THREE.Vector3(0, 60, -2.5),
    content: <>
        <div>Physics:</div>
        <div><a href={'https://github.com/pmndrs/react-three-rapier'}>@react-three/rapier</a></div>
      </>,
    color: 0x11568E
  },
  {
    position: new THREE.Vector3(0.75, 40, -2.5),
    content: <>
        <div>Animation:</div>
        <div><a href={'https://www.react-spring.dev/docs/guides/react-three-fiber'}>@react-spring/three</a></div>
      </>
  },
  {
    position: new THREE.Vector3(-0.75, 19, -2.5),
    content: <>
      <div>3D rendering:</div>
      <div><a href={'https://github.com/pmndrs/react-three-fiber'}>@react-three/fiber</a></div>
      <div><a href={'https://github.com/pmndrs/drei'}>@react-three/drei</a></div>
      <div><a href={'https://github.com/mrdoob/three.js'}>three.js</a></div>
    </>,
    height: 2,
    color: 0x11568E
  },
  {
    position: new THREE.Vector3(0, 10, -2.5),
    content: <>
      <div>Tooling: <a href={'https://vitejs.dev/'}>Vite</a></div>
    </>
  },
  {
    position: new THREE.Vector3(0, 3, 0),
    rotationX: 0,
    content: <>
      <div className='infoHeading'>ABOUT</div>
    </>,
    height: 1.5,
    color: 0x555555
  }
];

const RAMP_POSITION = new THREE.Vector3(0,1.2,0);

const About = ({ opacity }: { opacity: SpringValue }) => {
  return (
    <>
      <Suspense>
        <Physics debug={false}>

          {INFOS.map((info, index) => {
            const color = typeof info.color !== 'undefined' ? info.color : uiColor;
            const rotationX = typeof info.rotationX !== 'undefined' ? info.rotationX : -Math.PI * 0.35;
            const height = info.height ? info.height : 1;
            return (
              <Info key={`${index}`} opacity={opacity} color={color} position={info.position} rotationX={rotationX} height={height}>
                {info.content}
              </Info>
            )
          })}

          <RampAnim opacity={opacity} position={RAMP_POSITION} />

        </Physics>
      </Suspense>
    </>
  )
}

export { About }