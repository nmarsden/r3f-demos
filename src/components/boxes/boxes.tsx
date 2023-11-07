import * as THREE from 'three'
import {Instance, Instances, useCursor} from "@react-three/drei";
import {animated, config, SpringValue, useSprings} from "@react-spring/three";
import {ThreeEvent, useFrame} from "@react-three/fiber";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {PAINTS, PaintSelectedEvent, Palette} from "./palette";

const BOX_COLOR = '#DDDDDD';
const BOX_HOVERED_COLOR = '#DDA522';
const BOX_HOVERED_SECONDARY_COLOR = '#93bfe7';

const BOX_SCALE = 1;
const BOX_HOVERED_SCALE = 1.5;
const BOX_HOVERED_SECONDARY_SCALE = 1.25;

const BOX_POS_Y = 0;
const BOX_HOVERED_POS_Y = 0.25;
const BOX_HOVERED_SECONDARY_POS_Y = 0.125;

const BOX_ROTATE = 0;
const BOX_NOT_SELECTED_ROTATE = 0;

const BOX_SIZE = 0.25;
const BOX_GAP = 0.125;
const NUM_ROWS = 21;
const NUM_COLUMNS = 21;

const X_WIDTH = (NUM_COLUMNS * BOX_SIZE) + ((NUM_COLUMNS - 1) * BOX_GAP);
const Y_WIDTH = (NUM_ROWS * BOX_SIZE) + ((NUM_ROWS - 1) * BOX_GAP);

const SELECTOR_RADIUS = (4 * BOX_SIZE) + (3 * BOX_GAP) - (0.5 * BOX_SIZE);

const POSITIONS: THREE.Vector3[] = new Array(NUM_ROWS * NUM_COLUMNS);
for (let row=0; row<NUM_ROWS; row++) {
  for (let col=0; col<NUM_COLUMNS; col++) {
    const index = (row * NUM_COLUMNS) + col;
    const x = (BOX_SIZE / 2) + (col * (BOX_SIZE + BOX_GAP)) - (X_WIDTH / 2);
    const z = (BOX_SIZE / 2) + (row * (BOX_SIZE + BOX_GAP)) - (Y_WIDTH / 2);
    POSITIONS[index] = new THREE.Vector3(x,0,z);
  }
}

const isPointInCircle = (point: THREE.Vector3, center: THREE.Vector3, radius: number): boolean => {
  const lhs = Math.pow(center.x - point.x, 2) + Math.pow(center.z - point.z, 2);
  const rhs = Math.pow(radius, 2);
  return lhs <= rhs;
}

const Boxes = ({ opacity }: { opacity: SpringValue }) => {
  const mesh = useRef<THREE.InstancedMesh>(null!);
  const [selectedPaint, setSelectedPaint] = useState(PAINTS[0])
  const [color, setColor] = useState([...POSITIONS].map(() => PAINTS[0].color));
  const [hovered, setHovered] = useState([...POSITIONS].map(() => false));
  const [selected, setSelected] = useState([...POSITIONS].map(() => false));
  const [hoveredPosition, setHoveredPosition] = useState(new THREE.Vector3(0,0,0))
  const [anyHover, setAnyHover] = useState(false)
  const [springs, api] = useSprings(
    POSITIONS.length,
    () => ({
      scale: BOX_SCALE,
      posY: BOX_POS_Y,
      rotate: BOX_ROTATE,
      color: BOX_COLOR,
      config: (key) => {
        switch(key) {
          case 'rotate': return config.molasses;
          case 'color': return config.gentle;
          default: return config.wobbly;
        }
      },
    })
  );
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useCursor(anyHover)

  useEffect(() => {
    const hoveredIndex = hovered.findIndex(s => s);

    const hoveredPos = hoveredIndex >= 0 ? POSITIONS[hoveredIndex] : hoveredPosition;
    setHoveredPosition(hoveredPos);

    api.start(index => {
      const isHovered = hovered[index];
      const isHoveredSecondary = isPointInCircle(POSITIONS[index], hoveredPos, SELECTOR_RADIUS);
      return {
        scale: isHovered ? BOX_HOVERED_SCALE : (isHoveredSecondary ? BOX_HOVERED_SECONDARY_SCALE : BOX_SCALE),
        posY: isHovered ? BOX_HOVERED_POS_Y : (isHoveredSecondary ? BOX_HOVERED_SECONDARY_POS_Y : BOX_POS_Y),
        color: isHovered ? BOX_HOVERED_COLOR : (isHoveredSecondary ? BOX_HOVERED_SECONDARY_COLOR : BOX_COLOR),
      }
    })
    setAnyHover(hoveredIndex >= 0)
  }, [hovered]);

  useEffect(() => {
    api.start(index => {
      const isSelected = selected[index];
      return {
        from: {
          rotate: BOX_ROTATE,
        },
        to: {
          rotate: isSelected ? BOX_ROTATE : BOX_NOT_SELECTED_ROTATE,
        },
        loop: !isSelected
      }
    })
  }, [selected]);

  useFrame(() => {
    if (mesh.current !== null) {
      POSITIONS.forEach((position, index) => {
        const isSelected = selected[index];

        const scale = springs[index].scale.get();
        const posY = springs[index].posY.get();

        // TODO combine selected color and animated color
        const boxColor = isSelected ? color[index] : springs[index].color.get();
        const rotate = springs[index].rotate.get();

        dummy.position.set(position.x, posY, position.z);
        dummy.rotation.set(rotate, rotate, rotate);
        dummy.scale.set(scale, scale, scale);
        dummy.updateMatrix();

        mesh.current.setMatrixAt(index, dummy.matrix);
        mesh.current.setColorAt(index, new THREE.Color(boxColor));
      });

      mesh.current.instanceMatrix.needsUpdate = true;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      mesh.current.instanceColor.needsUpdate = true;
    }
  });
  const onPointerOver = useCallback((event: ThreeEvent<MouseEvent>): void => {
    const index = event.object.userData.index;
    setHovered(prevState => prevState.map((item, idx) => idx === index ? true : item));
    event.stopPropagation();
  }, []);

  const onPointerOut = useCallback((event: ThreeEvent<MouseEvent>): void => {
    const index = event.object.userData.index;
    setHovered(prevState => prevState.map((item, idx) => idx === index ? false : item));
    event.stopPropagation();
  }, []);

  const onClick = useCallback((event: ThreeEvent<MouseEvent>): void => {
    const index = event.object.userData.index;
    setSelected(prevState => prevState.map((item, idx) => {
      const isInCircle = isPointInCircle(POSITIONS[idx], POSITIONS[index], SELECTOR_RADIUS);
      return isInCircle ? true : item;
    }));
    setColor(prevState => prevState.map((item, idx) => {
      const isInCircle = isPointInCircle(POSITIONS[idx], POSITIONS[index], SELECTOR_RADIUS);
      return isInCircle ? selectedPaint.color : item;
    }));
    event.stopPropagation();
  }, [selectedPaint]);

  const onPaintSelected = useCallback((event: PaintSelectedEvent): void => {
    setSelectedPaint(event.selectedPaint);
  }, [])

  const isTransitioning = opacity.isAnimating;

  // Reset selected if necessary when transitioning in/out
  if (isTransitioning && selected.some(s => s)) {
    setSelected(prevState => prevState.map(() => false));
  }

  return (
    <>
      <Instances
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        ref={mesh}
        castShadow={true}
        limit={1000} // Optional: max amount of items (for calculating buffer size)
        range={1000} // Optional: draw-range
      >
        <boxGeometry args={[BOX_SIZE, BOX_SIZE, BOX_SIZE]}/>
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/* @ts-ignore */}
        <animated.meshStandardMaterial
          metalness={0.15}
          roughness={0.75}
          color={BOX_COLOR}
          transparent={true}
          opacity={opacity}
        />
        {POSITIONS.map((_position, index) =>
          <Instance
            key={index}
            userData={{ index }}
            onPointerOver={onPointerOver}
            onPointerOut={onPointerOut}
            onClick={onClick}
          />
        )}
      </Instances>
      <Palette opacity={opacity} selectedPaint={selectedPaint} onPaintSelected={onPaintSelected} />
    </>
  )
}

export { Boxes }