/* eslint-disable @typescript-eslint/ban-ts-comment */
import {animated, config, SpringValue, useSpring} from "@react-spring/three";
import {Box, Outlines, useCursor} from "@react-three/drei";
import {HALF_MAZE_SIZE, MAZE_SIZE} from "./mazeConstants.ts";
import {useCallback, useEffect, useState} from "react";
import {ThreeEvent} from "@react-three/fiber";

const Y_POSITION = 0.3;

const BUTTONS = [
  'top-left', 'top', 'top-right',
  'left', 'center', 'right',
  'bottom-left', 'bottom', 'bottom-right' ];

export type Button = typeof BUTTONS[number];

export type ButtonPressedEvent = {
  button: Button;
};

type ButtonHoverChangedEvent = {
  isHovered: boolean;
};

const BUTTON_GAP = 0.05;
const BUTTON_DEPTH = 0.05;
const BUTTON_SIZE = (MAZE_SIZE - (BUTTON_GAP * 2)) / 3;
const HALF_BUTTON_SIZE = BUTTON_SIZE / 2;

type ButtonControlProps = {
  opacity: SpringValue;
  paused: boolean;
  button: Button;
  selected: boolean;
  position: [number, number, number];
  onButtonPressed: (event: ButtonPressedEvent) => void;
  onButtonHoverChanged: (event: ButtonHoverChangedEvent) => void;
};

const ButtonControl = ({ opacity, paused, button, selected, position, onButtonPressed, onButtonHoverChanged }: ButtonControlProps) => {
  const [hovered, setHovered] = useState(false);

  const onPointerOver = useCallback((event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    if (paused) return;
    setHovered(true);
    onButtonHoverChanged({ isHovered: true });
  }, [paused])

  const onPointerOut = useCallback(() => {
    setHovered(false);
    onButtonHoverChanged({ isHovered: false });
  }, [paused])

  return (
    <Box
      args={[BUTTON_SIZE, BUTTON_DEPTH, BUTTON_SIZE]}
      position={position}
      onClick={(event) => {
        event.stopPropagation();
        if (paused) return;
        onButtonPressed({ button })
      }}
      onPointerOver={(event) => onPointerOver(event)}
      onPointerOut={() => onPointerOut()}
    >
      { /* @ts-ignore */ }
      <animated.meshStandardMaterial
        color="#f3f3f3"
        wireframe={false}
        opacity={opacity}
        transparent={true}
      />
      {(hovered || selected) && (
        <Outlines
          thickness={0.02}
          color="orange"
          angle={Math.PI}
          screenspace={false}
          opacity={1}
          transparent={true}
        />
      )}
    </Box>
  );
}
const ButtonControls = ({ paused, onButtonPressed }: { paused: boolean; onButtonPressed: (event: ButtonPressedEvent) => void }) => {
  const [selectedButton, setSelectedButton] = useState<Button>('center');
  const [hovered, setHovered] = useState<boolean[]>(BUTTONS.map(() => false));
  const [anyHover, setAnyHover] = useState(false)
  const [{ opacity }, api] = useSpring(() => ({
    from: { opacity: 0 },
    config: config.molasses
  }))

  useCursor(anyHover)

  const onPressed = useCallback((event: ButtonPressedEvent) => {
    setSelectedButton(event.button);
    onButtonPressed(event);
  }, [onButtonPressed]);

  const onButtonHoverChanged = useCallback((event: ButtonHoverChangedEvent, index: number) => {
    setHovered(prevState => prevState.map((hovered, idx) => (idx === index) ? event.isHovered : hovered));
  }, [])

  useEffect(() => {
    const hoveredIndex = hovered.findIndex(s => s);
    setAnyHover(hoveredIndex >= 0)
  }, [hovered]);

  useEffect(() => {
    api.start({
      to: { opacity: 0.15 }
    })
  }, []);

  return (
    <>
      {BUTTONS.map((button, index) => {
        const column = index % 3;
        const row = Math.floor(index / 3);
        const x = (column * BUTTON_SIZE) - HALF_MAZE_SIZE + HALF_BUTTON_SIZE + (column * BUTTON_GAP);
        const z = (row * BUTTON_SIZE) - HALF_MAZE_SIZE + HALF_BUTTON_SIZE + (row * BUTTON_GAP);

        const position = [x, Y_POSITION, z] as [number, number, number];
        return (
          <ButtonControl
            key={`${index}`}
            opacity={opacity}
            paused={paused}
            button={button}
            selected={button === selectedButton}
            position={position}
            onButtonPressed={onPressed}
            onButtonHoverChanged={(event) => onButtonHoverChanged(event, index)}
          />
        )
      })}
    </>
  )
}

export { ButtonControls }