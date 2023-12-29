/* eslint-disable @typescript-eslint/ban-ts-comment */

import {CuboidCollider} from "@react-three/rapier";
import {useCallback} from "react";

const HOLE_WIDTH = 200;
const HOLE_HEIGHT = 25 - 1;
const HOLE_DEPTH = 6;

let isHit = false;

const Hole = ({ onHit, ...props } : { onHit: () => void } & JSX.IntrinsicElements['group']) => {
  const onIntersectionEnter = useCallback(() => {
    if (isHit) return;

    isHit = true;
    setTimeout(() => { isHit = false; }, 1000);

    onHit();
  }, [onHit]);

  return (
    <group position-y={HOLE_HEIGHT * 0.5}>
      <CuboidCollider
        args={[HOLE_WIDTH * 0.5, HOLE_HEIGHT * 0.5, HOLE_DEPTH * 0.5]}
        position={props.position}
        sensor={true}
        onIntersectionEnter={onIntersectionEnter}
      />
    </group>
  );
};

export { Hole }