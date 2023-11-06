import * as THREE from 'three'
import {Instance, Instances, useCursor} from "@react-three/drei";
import {animated, config, SpringValue, useSprings} from "@react-spring/three";
import {ThreeEvent, useFrame} from "@react-three/fiber";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";

const BOX_COLOR = '#FFFFFF';
const BOX_SELECTED_COLOR = '#2176AE';
const BOX_SELECTED_SECONDARY_COLOR = '#93bfe7';

const BOX_SCALE = 1;
const BOX_SELECTED_SCALE = 1.5;
const BOX_SELECTED_SECONDARY_SCALE = 1.25;

const BOX_POS_Y = 0;
const BOX_SELECTED_POS_Y = 0.25;
const BOX_SELECTED_SECONDARY_POS_Y = 0.125;

const BOX_SIZE = 0.25;
const BOX_GAP = 0.125;
const NUM_ROWS = 20;
const NUM_COLUMNS = 20;

const X_WIDTH = (NUM_COLUMNS * BOX_SIZE) + ((NUM_COLUMNS - 1) * BOX_GAP);
const Y_WIDTH = (NUM_ROWS * BOX_SIZE) + ((NUM_ROWS - 1) * BOX_GAP);

const POSITIONS: THREE.Vector3[] = new Array(NUM_ROWS * NUM_COLUMNS);
for (let row=0; row<NUM_ROWS; row++) {
  for (let col=0; col<NUM_COLUMNS; col++) {
    const index = (row * NUM_COLUMNS) + col;
    const x = (BOX_SIZE / 2) + (col * (BOX_SIZE + BOX_GAP)) - (X_WIDTH / 2);
    const z = (BOX_SIZE / 2) + (row * (BOX_SIZE + BOX_GAP)) - (Y_WIDTH / 2);
    POSITIONS[index] = new THREE.Vector3(x,0,z);
  }
}

const toRow = (index: number): number => {
  return Math.floor(index / NUM_COLUMNS);
}
const toColumn = (index: number): number => {
  return Math.floor(index % NUM_COLUMNS);
}

const Boxes = ({ opacity }: { opacity: SpringValue }) => {
  const mesh = useRef<THREE.InstancedMesh>(null!);
  const [selected, setSelected] = useState([...POSITIONS].map(() => false));
  const [hovered, setHovered] = useState(false)
  const [springs, api] = useSprings(
    POSITIONS.length,
    () => ({
      scale: BOX_SCALE,
      posY: BOX_POS_Y,
      color: BOX_COLOR,
      config: (key) => key !== 'color' ? config.wobbly : config.gentle,
    })
  );
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useCursor(hovered)

  useEffect(() => {
    const selectedIndex = selected.findIndex(s => s);

    api.start(index => {
      const isSelected = selected[index];
      const isSelectedSecondary = toRow(selectedIndex) === toRow(index) || toColumn(selectedIndex) === toColumn(index);
      return {
        scale: isSelected ? BOX_SELECTED_SCALE: (isSelectedSecondary ? BOX_SELECTED_SECONDARY_SCALE : BOX_SCALE),
        posY: isSelected ? BOX_SELECTED_POS_Y: (isSelectedSecondary ? BOX_SELECTED_SECONDARY_POS_Y : BOX_POS_Y),
        color: isSelected ? BOX_SELECTED_COLOR: (isSelectedSecondary ? BOX_SELECTED_SECONDARY_COLOR : BOX_COLOR),
      }
    })
    setHovered(selected.some(s => s))
  }, [selected]);

  useFrame(() => {
    if (mesh.current !== null) {
      POSITIONS.forEach((position, index) => {
        const scale = springs[index].scale.get();
        const posY = springs[index].posY.get();
        const color = springs[index].color.get();

        dummy.position.set(position.x, posY, position.z);
        dummy.scale.set(scale, scale, scale);
        dummy.updateMatrix();

        mesh.current.setMatrixAt(index, dummy.matrix);
        mesh.current.setColorAt(index, new THREE.Color(color));
      });

      mesh.current.instanceMatrix.needsUpdate = true;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      mesh.current.instanceColor.needsUpdate = true;
    }
  });
  const onPointerOver = useCallback((event: ThreeEvent<MouseEvent>): void => {
    const index = event.object.userData.index;
    setSelected(prevState => prevState.map((item, idx) => idx === index ? true : item));
    event.stopPropagation();
  }, []);

  const onPointerOut = useCallback((event: ThreeEvent<MouseEvent>): void => {
    const index = event.object.userData.index;
    setSelected(prevState => prevState.map((item, idx) => idx === index ? false : item));
    event.stopPropagation();
  }, []);

  return (
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
        metalness={0.75}
        roughness={0.15}
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
        />
      )}
    </Instances>
  )
}

export { Boxes }