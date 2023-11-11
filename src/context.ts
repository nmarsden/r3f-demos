import {createContext, RefObject} from "react";
import {OrbitControls as OrbitControlsImpl } from 'three-stdlib';

type OrbitControlsContextType = {
  controls: RefObject<OrbitControlsImpl>
};

export const OrbitControlsContext = createContext<OrbitControlsContextType>(null!)
