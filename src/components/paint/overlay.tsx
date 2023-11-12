import {Html} from "@react-three/drei";
import {SpringValue} from "@react-spring/three";
import {ReactNode, useCallback, useState} from "react";
import "./overlay.css";

export type PaintColor = {
  name: string;
  color: string;
}

export type PaintColorSelectedEvent = {
  selectedPaintColor: PaintColor;
}

export const PAINT_COLORS: PaintColor[] = [
  { name: 'dark-blue', color: '#173F5F' },
  { name: 'blue', color: '#20639B' },
  { name: 'green', color: '#3CAEA3' },
  { name: 'yellow', color: '#F6D55C' },
  { name: 'red', color: '#ED553B' },
  { name: 'black', color: '#222222' },
  { name: 'white', color: '#DDDDDD' },
]

export type PaintBrush = {
  name: string;
  size: number;
}

export type PaintBrushSelectedEvent = {
  selectedPaintBrush: PaintBrush;
}

export const PAINT_BRUSHES: PaintBrush[] = [
  { name: 'smallest', size: 1 },
  { name: 'small', size: 2 },
  { name: 'medium', size: 3 },
  { name: 'large', size: 4 },
]

type OpenMenu = 'NONE' | 'PAINT_COLOR' | 'PAINT_BRUSH';

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

const PaintColorButton = ({ paintColor, isSelected, onSelected }: { paintColor: PaintColor, isSelected: boolean, onSelected: () => void }) => {
  return (
    <div
      className={isSelected ? 'toolbarButton selected' : 'toolbarButton'}
      style={{ backgroundColor: paintColor.color }}
      onPointerDown={onSelected}
    />
  )
}

const PaintColorSelector = ({ selectedPaintColor, onPaintColorSelected, isMenuOpen, onMenuOpenChange } : { selectedPaintColor: PaintColor, onPaintColorSelected: (event: PaintColorSelectedEvent) => void, isMenuOpen: boolean, onMenuOpenChange: (event: MenuOpenChangeEvent) => void }) => {
  return (
    <>
      <div className={isMenuOpen ? 'toolbarMenu open' : 'toolbarMenu'} >
        {PAINT_COLORS.map(paintColor =>
          <PaintColorButton
            key={paintColor.name}
            paintColor={paintColor}
            isSelected={selectedPaintColor.name === paintColor.name}
            onSelected={() => {
              onPaintColorSelected({ selectedPaintColor: paintColor })
              onMenuOpenChange({ isOpen: !isMenuOpen })
            }}
          />
        )}
      </div>
      <PaintColorButton
        paintColor={selectedPaintColor}
        isSelected={isMenuOpen}
        onSelected={() => onMenuOpenChange({ isOpen: !isMenuOpen })}
      />
    </>
  )
}

const PaintBrushButton = ({ paintBrush, isSelected, onSelected }: { paintBrush: PaintBrush, isSelected: boolean, onSelected: () => void }) => {
  const className = `toolbarButton brush-${paintBrush.name}`;
  return (
    <div
      className={isSelected ? `${className} selected` : className}
      onPointerDown={onSelected}
    />
  )
}

const PaintBrushSelector = ({ selectedPaintBrush, onPaintBrushSelected, isMenuOpen, onMenuOpenChange } : { selectedPaintBrush: PaintBrush, onPaintBrushSelected: (event: PaintBrushSelectedEvent) => void, isMenuOpen: boolean, onMenuOpenChange: (event: MenuOpenChangeEvent) => void }) => {
  return (
    <>
      <div className={isMenuOpen ? 'toolbarMenu menu-brush open' : 'toolbarMenu menu-brush'} >
        {PAINT_BRUSHES.map(paintBrush =>
          <PaintBrushButton
            key={paintBrush.name}
            paintBrush={paintBrush}
            isSelected={selectedPaintBrush.name === paintBrush.name}
            onSelected={() => {
              onPaintBrushSelected({ selectedPaintBrush: paintBrush })
              onMenuOpenChange({ isOpen: !isMenuOpen })
            }}
          />
        )}
      </div>
      <PaintBrushButton
        paintBrush={selectedPaintBrush}
        isSelected={isMenuOpen}
        onSelected={() => onMenuOpenChange({ isOpen: !isMenuOpen })}
      />
    </>
  )
}

const Overlay = ({ opacity, selectedPaintColor, selectedPaintBrush, onPaintColorSelected, onPaintBrushSelected, onPointerUp } : { opacity: SpringValue, selectedPaintColor: PaintColor, selectedPaintBrush: PaintBrush, onPaintColorSelected: (event: PaintColorSelectedEvent) => void, onPaintBrushSelected: (event: PaintBrushSelectedEvent) => void, onPointerUp: () => void }) => {
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
          <PaintColorSelector
            selectedPaintColor={selectedPaintColor}
            onPaintColorSelected={onPaintColorSelected}
            isMenuOpen={openMenu === 'PAINT_COLOR'}
            onMenuOpenChange={event => onMenuOpenChange('PAINT_COLOR', event)}
          />
          <PaintBrushSelector
            selectedPaintBrush={selectedPaintBrush}
            onPaintBrushSelected={onPaintBrushSelected}
            isMenuOpen={openMenu === 'PAINT_BRUSH'}
            onMenuOpenChange={event => onMenuOpenChange('PAINT_BRUSH', event)}
          />
        </Toolbar>
      </div>
    </Html>
  )
}

export { Overlay }