/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as THREE from 'three';
import {SpringValue} from "@react-spring/three";
import {useCallback, useContext, useEffect, useMemo, useState} from "react";
import {MainContext} from "../../mainContext.ts";
import {useDemos} from "../../hooks/demos.ts";
import {useCursor} from "@react-three/drei";
import {DemoBox, HoverChangedEvent} from "./demoBox.tsx";

const DEMO_BOXES_RADIUS = 2.5;
const DEMO_BOXES_TOTAL_ANGLE = Math.PI * 0.5;
const DEMO_BOXES_START_ANGLE = -(DEMO_BOXES_TOTAL_ANGLE * 0.5);
const DEMO_BOX_SIZE = 0.5;


const DemoBoxes = ({ opacity }: { opacity: SpringValue }) => {
  const mainContext = useContext(MainContext)
  const demos = useDemos(mainContext.pages.filter(page => page.screenshot !== ''))
  const [hovered, setHovered] = useState<boolean[]>([]);
  const [anyHover, setAnyHover] = useState(false)

  useCursor(anyHover)

  const boxAngleDiff = useMemo(() => {
    return DEMO_BOXES_TOTAL_ANGLE / (demos.length - 1);
  }, [demos])

  const onHoverChanged = useCallback((event: HoverChangedEvent, index: number) => {
    setHovered(prevState => prevState.map((hovered, idx) => (idx === index) ? event.isHovered : hovered));
  }, [])

  useEffect(() => {
    setHovered(demos.map(() => false));
  }, [demos])

  useEffect(() => {
    const hoveredIndex = hovered.findIndex(s => s);
    setAnyHover(hoveredIndex >= 0)
  }, [hovered]);

  return (
    <>
      {demos.map((demo, index) => {
        const angle = DEMO_BOXES_START_ANGLE + (boxAngleDiff * index);
        const posX = DEMO_BOXES_RADIUS * Math.sin(angle);
        const posZ = DEMO_BOXES_RADIUS * Math.cos(angle);

        const position: THREE.Vector3 = new THREE.Vector3(posX, -1, posZ);
        const risingDelayMsecs = 0;

        return <DemoBox key={`${index}`} opacity={opacity} position={position} size={DEMO_BOX_SIZE} risingDelayMsecs={risingDelayMsecs} demo={demo} onHoverChanged={(event) => onHoverChanged(event, index)}/>
      })}
    </>
  )
}

export { DemoBoxes }