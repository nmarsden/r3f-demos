import {createContext, RefObject} from "react";
import {OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import {Page} from "./components/menu/menu";

type MainContextType = {
  controls: RefObject<OrbitControlsImpl>;
  pages: Page[];
};

export const MainContext = createContext<MainContextType>(null!)
