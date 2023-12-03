import {useEffect, useState} from "react";
import {SpringValue} from "@react-spring/three";

export type TransitionState = 'ENTERING' | 'LEAVING' | 'NONE';

export function useTransitionState(opacity: SpringValue) {
  const [transitionState, setTransitionState] = useState<TransitionState>('ENTERING');
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

  useEffect(() => {
    if (!opacity.isAnimating) {
      setTransitionState('NONE');
    } else if (isEntering) {
      setTransitionState('ENTERING');
    } else if (isLeaving) {
      setTransitionState('LEAVING')
    }
  }, [isEntering, isLeaving, opacity.isAnimating])

  return transitionState;
}