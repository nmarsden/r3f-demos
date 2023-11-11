import {Html} from "@react-three/drei";
import {SpringValue} from "@react-spring/three";
import {useState} from "react";
import "./palette.css";

export type PaintColor = {
  name: string;
  color: string
}

export type PaintSelectedEvent = {
  selectedPaint: PaintColor;
}

export const PAINTS: PaintColor[] = [
  { name: 'dark-blue', color: '#173F5F' },
  { name: 'blue', color: '#20639B' },
  { name: 'green', color: '#3CAEA3' },
  { name: 'yellow', color: '#F6D55C' },
  { name: 'red', color: '#ED553B' },
  { name: 'black', color: '#222222' },
  { name: 'white', color: '#DDDDDD' },
]

const Palette = ({ opacity, selectedPaint, onPaintSelected, onPointerUp } : { opacity: SpringValue, selectedPaint: PaintColor, onPaintSelected: (event: PaintSelectedEvent) => void, onPointerUp: () => void }) => {
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
        className={'overlay'}
        onPointerUp={() => {
          onPointerUp()
        }}
      >
        <div
          className={`palette ${isEntering ? 'isEntering': ''} ${isLeaving ? 'isLeaving': ''}`}
          onPointerDown={(event) => {
            const targetId = (event.target as Element).id;
            const selectedPaint = (PAINTS.find(paint => paint.name === targetId) as PaintColor);
            if (selectedPaint) {
              onPaintSelected({ selectedPaint });
            }
          }}
        >
          {PAINTS.map(paint =>
            <div
              key={paint.name}
              id={paint.name}
              className={selectedPaint.name === paint.name ? 'paint selected' : 'paint'}
              style={{ backgroundColor: paint.color }}
            />
          )}
        </div>
      </div>
    </Html>
  )
}

export { Palette }