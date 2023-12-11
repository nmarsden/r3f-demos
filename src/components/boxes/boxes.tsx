/* eslint-disable @typescript-eslint/ban-ts-comment */
import {SpringValue} from "@react-spring/three";
import {Suspense, useCallback, useEffect, useState} from "react";
import {Physics, RigidBody, CuboidCollider} from "@react-three/rapier";
import {GrabbableBox, GrabbedChangeEvent, HoveredChangeEvent} from "./grabbableBox";
import {ButtonHoveredChangedEvent, PushButton} from "../pushButton/pushButton.tsx";
import {Counter} from "./counter";
import * as THREE from "three";

const MAX_NUM_BOXES = 100;

const BUTTON_POSITION = new THREE.Vector3(0, -1.3, 1.75);

const Boxes = ({ opacity }: { opacity: SpringValue }) => {
  const [isShowBox, setShowBox] = useState([...Array(MAX_NUM_BOXES)].map(() => false));
  const [isButtonHovered, setButtonHovered] = useState(false);
  const [isBoxHovered, setBoxHovered] = useState([...Array(MAX_NUM_BOXES)].map(() => false));
  const [isAnyBoxHovered, setAnyBoxHovered] = useState(false);
  const [isBoxGrabbed, setBoxGrabbed] = useState([...Array(MAX_NUM_BOXES)].map(() => false));
  const [isAnyBoxGrabbed, setAnyBoxGrabbed] = useState(false);
  const [nextBoxIndex, setNextBoxIndex] = useState(0);
  const [isExploded, setExploded] = useState(false);

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
      setExploded(true)
      setTimeout(() => {
        setExploded(false)
        // Hide all boxes
        setShowBox([...Array(MAX_NUM_BOXES)].map(() => false))
      }, 3000)
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
                      isExploded={isExploded}
                    />
                  );
                })
              }
              <RigidBody type={'fixed'} colliders={'cuboid'}>
                <PushButton opacity={opacity} position={BUTTON_POSITION} scale={0.25} onHoveredChanged={onButtonHoveredChanged} onButtonClicked={onButtonClicked} enabled={!isAnyBoxGrabbed && !isExploded}/>
              </RigidBody>

              <CuboidCollider position={[0, -1.5, 0]} args={[20, 0.2, 20]} />
            </>
          ) : (
            <>
              <PushButton opacity={opacity} position={BUTTON_POSITION} scale={0.25} onHoveredChanged={onButtonHoveredChanged} onButtonClicked={onButtonClicked} enabled={false}/>
            </>
          )}
        </Physics>
        <Counter opacity={opacity} count={nextBoxIndex} maxCount={MAX_NUM_BOXES} />
      </Suspense>
    </>
  )
}

export { Boxes }