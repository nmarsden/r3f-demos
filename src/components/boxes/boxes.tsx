/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  Html,
  Lathe
} from "@react-three/drei";
import {animated, config, SpringValue, useSpring} from "@react-spring/three";
import * as THREE from 'three'
import {Suspense, useCallback, useEffect, useMemo, useState} from "react";
import {Physics, RigidBody, CuboidCollider} from "@react-three/rapier";
import {GrabbableBox, GrabbedChangeEvent, HoveredChangeEvent} from "./grabbableBox";
import './boxes.css';

const MAX_NUM_BOXES = 100;

const ButtonBase = ({ opacity }: { opacity: SpringValue }) => {
  const triangleShape = useMemo(() => {
    const triangleShape = new THREE.Shape();
    triangleShape.moveTo(2, 0.5);
    triangleShape.lineTo(2, 0);
    triangleShape.lineTo(2.5, 0);
    triangleShape.lineTo(2, 0.5);
    return triangleShape;
  }, [])

  return (
    <Lathe
      args={[triangleShape.getPoints(), 32]}
      castShadow={true}
      receiveShadow={true}
    >
      {/* @ts-ignore */}
      <animated.meshStandardMaterial
        metalness={0.15}
        roughness={0.75}
        color={'grey'}
        transparent={true}
        opacity={opacity}
      />
    </Lathe>
  )
}

type ButtonHoveredChangedEvent = {
  isHovered: boolean;
}
type PushButtonProps = {
  opacity: SpringValue,
  onHoveredChanged: (event: ButtonHoveredChangedEvent) => void,
  onButtonClicked: () => void,
  enabled: boolean
}

// TODO extract PushButton to a separate file
const PushButton = ({ opacity, onHoveredChanged, onButtonClicked, enabled }: PushButtonProps) => {
  const [{ positionY }, api] = useSpring(() => ({
    from: { positionY: 0.5 },
    config: config.stiff
  }))

  const onPointerOver = useCallback(() => {
    if (!enabled) {
      return
    }
    onHoveredChanged({ isHovered: true })
  }, [enabled])

  const onPointerOut = useCallback(() => {
    if (!enabled) {
      return
    }
    onHoveredChanged({ isHovered: false })
  }, [enabled])

  const onPointerDown = useCallback(() => {
    if (!enabled) {
      return
    }
    api.start({
      to: [
        { positionY: 0.25 },
        { positionY: 0.5 }
      ]
    })
    onButtonClicked()
  }, [enabled, onButtonClicked])

  return <group
      scale={0.25}
      position-z={1.75}
      position-y={-1.3}
    >
    <ButtonBase opacity={opacity} />
    <animated.mesh
      position-y={positionY}
      castShadow={true}
      receiveShadow={true}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      onPointerDown={onPointerDown}
    >
      <cylinderGeometry args={[2, 2, 0.5]} />
      {/* @ts-ignore */}
      <animated.meshStandardMaterial
        metalness={0.75}
        roughness={0.15}
        color={'red'}
        transparent={true}
        opacity={opacity}
      />
    </animated.mesh>
  </group>
}

const Counter = ({ opacity, count, maxCount } : { opacity: SpringValue, count: number, maxCount: number }) => {
  const [isEntering, setIsEntering] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  if (opacity.isAnimating && !isEntering && opacity.goal === 1) {
    setIsEntering(true);
    setIsLeaving(false);
  }
  if (opacity.isAnimating && !isLeaving && opacity.goal === 0) {
    setIsEntering(false);
    setIsLeaving(true);
  }
  return (
    <Html
      fullscreen={true}
      occlude={false}
      zIndexRange={[100, 0]}
    >
      <div
        className={`boxCounter ${isEntering ? 'isEntering': ''} ${isLeaving ? 'isLeaving': ''}`}
        style={{ color: (count === maxCount ? 'orange' : 'white' )}}
      >
        {count}
      </div>
    </Html>
  )
}

// TODO animate an explosion before hiding all boxes
// TODO put a marker on the ground to show where the boxes will drop when the button is pressed
const Boxes = ({ opacity }: { opacity: SpringValue }) => {
  const [isShowBox, setShowBox] = useState([...Array(MAX_NUM_BOXES)].map(() => false));
  const [isButtonHovered, setButtonHovered] = useState(false);
  const [isBoxHovered, setBoxHovered] = useState([...Array(MAX_NUM_BOXES)].map(() => false));
  const [isAnyBoxHovered, setAnyBoxHovered] = useState(false);
  const [isBoxGrabbed, setBoxGrabbed] = useState([...Array(MAX_NUM_BOXES)].map(() => false));
  const [isAnyBoxGrabbed, setAnyBoxGrabbed] = useState(false);
  const [nextBoxIndex, setNextBoxIndex] = useState(0);

  useEffect(() => {
    document.body.style.cursor = (isButtonHovered || isAnyBoxHovered) ? 'pointer' : isAnyBoxGrabbed ? 'grab' : 'auto'
    return () => {
      document.body.style.cursor = 'auto';
    }
  }, [isButtonHovered, isAnyBoxHovered, isAnyBoxGrabbed])

  useEffect(() => {
    setAnyBoxHovered(isBoxHovered.some(item => item));
  }, [isBoxHovered])

  useEffect(() => {
    setAnyBoxGrabbed(isBoxGrabbed.some(item => item));
  }, [isBoxGrabbed])

  const onButtonHoveredChanged = useCallback((event: ButtonHoveredChangedEvent) => {
    setButtonHovered(event.isHovered)
  }, [])

  const onButtonClicked = useCallback(() => {
    if (nextBoxIndex === MAX_NUM_BOXES) {
      // Hide all boxes
      setShowBox([...Array(MAX_NUM_BOXES)].map(() => false))
    } else {
      // Show next box
      setShowBox(prevState => prevState.map((item, idx) => idx === nextBoxIndex ? true : item));
    }
    setNextBoxIndex(nextBoxIndex < (MAX_NUM_BOXES) ? (nextBoxIndex + 1) : 0);
  }, [nextBoxIndex])

  const onBoxHoveredChanged = useCallback((boxIndex: number, event: HoveredChangeEvent) => {
    setBoxHovered(prevState => prevState.map((item, idx) => idx === boxIndex ? event.isHovered : item));
  }, [])

  const onBoxGrabbedChanged = useCallback((boxIndex: number, event: GrabbedChangeEvent) => {
    setBoxGrabbed(prevState => prevState.map((item, idx) => idx === boxIndex ? event.isGrabbed : item));
  }, [])

  if (opacity.isAnimating && nextBoxIndex !== 0) {
    setNextBoxIndex(0);
    setShowBox([...Array(MAX_NUM_BOXES)].map(() => false))
  }

  return (
    <>
      <Suspense>
        <Physics debug={false}>

          {!opacity.isAnimating ? (
            <>
              {isShowBox.map((isShown, index) => {
                  return (
                    <GrabbableBox
                      key={`${index}`}
                      boxId={`box-${index}`}
                      opacity={opacity}
                      isShown={isShown}
                      canGrab={!isAnyBoxGrabbed || isBoxGrabbed[index]}
                      onHoveredChanged={(event) => onBoxHoveredChanged(index, event)}
                      onGrabbedChanged={(event) => onBoxGrabbedChanged(index, event)}
                    />
                  );
                })
              }
              <RigidBody type={'fixed'} colliders={'cuboid'}>
                <PushButton opacity={opacity} onHoveredChanged={onButtonHoveredChanged} onButtonClicked={onButtonClicked} enabled={!isAnyBoxGrabbed}/>
              </RigidBody>

              <CuboidCollider position={[0, -1.5, 0]} args={[20, 0.2, 20]} />
            </>
          ) : (
            <>
              <PushButton opacity={opacity} onHoveredChanged={onButtonHoveredChanged} onButtonClicked={onButtonClicked} enabled={false}/>
            </>
          )}
        </Physics>
        <Counter opacity={opacity} count={nextBoxIndex} maxCount={MAX_NUM_BOXES} />
      </Suspense>
    </>
  )
}

export { Boxes }