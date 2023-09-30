import './index.css'
import {createRoot} from 'react-dom/client'
import {Canvas} from '@react-three/fiber'
import {Cube} from "./cube/cube";

const App = () => {
  return (
    <Canvas
      shadows={true}
      camera={{ position: [-3, 0, 5], fov: 70 }}
    >
      <Cube />
    </Canvas>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
