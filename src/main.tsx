import { createRoot } from 'react-dom/client'
import { Canvas } from '@react-three/fiber'
import { getProject } from '@theatre/core'
import studio from '@theatre/studio'
import extension from '@theatre/r3f/dist/extension'
import {editable as e, PerspectiveCamera, SheetProvider} from '@theatre/r3f'
import './index.css'

studio.initialize()
studio.extend(extension)

const demoSheet = getProject('Demo Project').sheet('Demo Sheet')

const App = () => {
  return (
    <Canvas>
      <SheetProvider sheet={demoSheet}>
        <PerspectiveCamera theatreKey="Camera" makeDefault position={[-5, 5, 5]} fov={75} lookAt={[0, 0, 0]} />
        <ambientLight />
        <e.pointLight theatreKey="Light" position={[10, 10, 5]} />
        <e.mesh theatreKey="Cube">
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="orange" />
        </e.mesh>
      </SheetProvider>
    </Canvas>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
