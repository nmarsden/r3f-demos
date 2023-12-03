/* eslint-disable @typescript-eslint/ban-ts-comment */
import {CuboidCollider} from "@react-three/rapier";
import {SpringValue} from "@react-spring/three";

const FloorSensor = ({ opacity, onHit }: { opacity: SpringValue, onHit: () => void }) => {
  return opacity.isAnimating ? (
    <></>
  ) : (
    <CuboidCollider
      args={[5, 0.25, 5]}
      position={[0,-3,0]}
      sensor={true}
      onIntersectionEnter={onHit}
    />
  )
}

export { FloorSensor }