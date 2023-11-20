import {Page} from "../components/menu/menu";
import {useEffect, useState} from "react";
import * as THREE from "three";
import {useTexture} from "@react-three/drei";

export type Demo = {
  name: string;
  path: string;
  texture?: THREE.Texture;
};

export function useDemos(pages: Page[]) {
  const textures = useTexture(pages.map(page => page.screenshot))
  const [demos, setDemos] = useState<Demo[]>([])

  useEffect(() => {
    setDemos(pages.map(page => ({
      name: page.name,
      path: page.path
    })))
  }, [])

  useEffect(() => {
    setDemos(prevState => prevState.map((demo, idx) => {
      return { ...demo, texture: textures[idx] }
    }));
  }, [textures])

  return demos;
}