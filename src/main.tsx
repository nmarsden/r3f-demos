import './index.css'
import {createRoot} from 'react-dom/client'
import {Canvas} from '@react-three/fiber'
import {Shapes} from "./components/shapes";

const App = () => {
  return (
    <Canvas
      shadows={true}
      camera={{ position: [0, 2, 4.5], fov: 70 }}
    >
      <Shapes />
    </Canvas>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
