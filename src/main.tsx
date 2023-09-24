import './index.css'
import {createRoot} from 'react-dom/client'
import {Canvas} from '@react-three/fiber'
import {Cube} from "./cube/cube";

const App = () => {
  return (
    <Canvas camera={{
      position: [5, 5, -5],
      fov: 75,
    }}>
        <ambientLight />
        <pointLight position={[0, 1, -3]} />
        <Cube />
    </Canvas>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
