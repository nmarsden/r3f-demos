/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as THREE from 'three';
import {SpringValue} from "@react-spring/three";
import {useCallback, useContext, useEffect, useMemo, useState} from "react";
import {MainContext} from "../../mainContext.ts";
import {useDemos} from "../../hooks/demos.ts";
import {useCursor} from "@react-three/drei";
import {DemoBox, HoverChangedEvent} from "./demoBox.tsx";

const DEMO_BOX_SIZE = 0.6;
const DEMO_BOX_GAP = 0.4;


const DemoBoxes = ({ opacity }: { opacity: SpringValue }) => {
  const mainContext = useContext(MainContext)
  const demos = useDemos(mainContext.pages.filter(page => page.path !== '/'))
  const [hovered, setHovered] = useState<boolean[]>([]);
  const [anyHover, setAnyHover] = useState(false)

  useCursor(anyHover)

  const totalBoxesWidth = useMemo(() => {
    return (demos.length * DEMO_BOX_SIZE) + ((demos.length - 1) * DEMO_BOX_GAP);
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
        const posX = (index * (DEMO_BOX_SIZE + DEMO_BOX_GAP)) - (totalBoxesWidth / 2) + (DEMO_BOX_SIZE / 2);
        const position: THREE.Vector3 = new THREE.Vector3(posX, -1, 1.25);

        return <DemoBox key={`${index}`} opacity={opacity} position={position} size={DEMO_BOX_SIZE} demo={demo} onHoverChanged={(event) => onHoverChanged(event, index)}/>
      })}
    </>
  )
}

export { DemoBoxes }