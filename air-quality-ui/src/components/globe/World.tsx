import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRef, useEffect, memo } from "react"

import { SurfaceLayer, SurfaceLayerRef } from "./SurfaceLayer"

const World = (): JSX.Element => {

    const surface_layer_ref = useRef<SurfaceLayerRef>(null)



    return (
        <Canvas
            style={{ background: 'white', height: '600px', width: '100%' }}
            camera={{ position: [0, 0, 1.5], near: 0.1, far: 1000 }} // Set initial camera position
        >
        <ambientLight />
        <directionalLight position={[0, 5, 0]} />
        {/* <mesh>
          <boxGeometry args={[3, 3, 3]} />
          <meshStandardMaterial color={'orange'} />
        </mesh> */}
        <SurfaceLayer ref={surface_layer_ref} />
        <OrbitControls />
      </Canvas>
    )
  }
  
  export default World