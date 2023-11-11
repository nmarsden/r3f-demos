import {Html} from "@react-three/drei";
import {SpringValue} from "@react-spring/three";
import {ReactNode, useCallback, useState} from "react";
import "./overlay.css";

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

type OpenMenu = 'NONE' | 'PAINT';

type MenuOpenChangeEvent = {
  isOpen: boolean;
}

const Toolbar = ({ opacity, children } : { opacity: SpringValue, children: ReactNode }) => {
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
      <div className={`toolbar ${isEntering ? 'isEntering': ''} ${isLeaving ? 'isLeaving': ''}`} >
        {children}
      </div>
  )
}

const PaintButton = ({ paint, isSelected, onSelected }: { paint: PaintColor, isSelected: boolean, onSelected: () => void }) => {
  return (
    <div
      className={isSelected ? 'paint selected' : 'paint'}
      style={{ backgroundColor: paint.color }}
      onPointerDown={onSelected}
    />
  )
}
const PaintSelector = ({ selectedPaint, onPaintSelected, isMenuOpen, onMenuOpenChange } : { selectedPaint: PaintColor, onPaintSelected: (event: PaintSelectedEvent) => void, isMenuOpen: boolean, onMenuOpenChange: (event: MenuOpenChangeEvent) => void }) => {
  return (
    <>
      <PaintButton
        paint={selectedPaint}
        isSelected={isMenuOpen}
        onSelected={() => onMenuOpenChange({ isOpen: !isMenuOpen })}
      />
      <div className={isMenuOpen ? 'paintMenu open' : 'paintMenu'} >
        {PAINTS.map(paint =>
          <PaintButton
            key={paint.name}
            paint={paint}
            isSelected={selectedPaint.name === paint.name}
            onSelected={() => onPaintSelected({ selectedPaint: paint })}
          />
        )}
      </div>
    </>
  )
}

const Overlay = ({ opacity, selectedPaint, onPaintSelected, onPointerUp } : { opacity: SpringValue, selectedPaint: PaintColor, onPaintSelected: (event: PaintSelectedEvent) => void, onPointerUp: () => void }) => {
  const [openMenu, setOpenMenu] = useState<OpenMenu>('NONE');

  const onMenuOpenChange = useCallback((menu: OpenMenu, event: MenuOpenChangeEvent) => {
    setOpenMenu(event.isOpen ? menu : 'NONE')
  }, [])

  if (opacity.isAnimating && openMenu !== 'NONE') {
    setOpenMenu('NONE')
  }

  return (
    <Html
      fullscreen={true}
      occlude={false}
      zIndexRange={[100, 0]}
    >
      <div className={'overlay'} onPointerUp={() => onPointerUp()}>
        <Toolbar opacity={opacity}>
          <PaintSelector
            selectedPaint={selectedPaint}
            onPaintSelected={onPaintSelected}
            isMenuOpen={openMenu === 'PAINT'}
            onMenuOpenChange={event => onMenuOpenChange('PAINT', event)}
          />
        </Toolbar>
      </div>
    </Html>
  )
}

export { Overlay }