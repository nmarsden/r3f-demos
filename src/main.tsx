import './index.css'
import {createRoot} from 'react-dom/client'
import {Canvas} from '@react-three/fiber'
import {Hand} from "./components/hand";
// import {Shapes} from "./components/shapes";
import {Loader} from "@react-three/drei";

const App = () => {
  return (
    <>
      <Canvas
        shadows={true}
        camera={{ position: [0, 2, 4.5], fov: 70 }}
      >
        <Hand />
        {/*<Shapes />*/}
      </Canvas>
      <Loader />
    </>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
