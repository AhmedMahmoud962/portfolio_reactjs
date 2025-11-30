import React, { Suspense, useEffect, useState, Component } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Preload, useGLTF } from '@react-three/drei'

import CanvasLoader from '../Loader'

// Fallback component with simple geometric shapes
const ComputersFallback = ({ isMobile }) => {
  return (
    <group>
      <hemisphereLight intensity={0.15} groundColor="black" />
      <spotLight
        position={[-20, 50, 10]}
        angle={0.12}
        penumbra={1}
        intensity={1}
        castShadow
        shadow-mapSize={1024}
      />
      <pointLight intensity={1} />
      {/* Simple geometric representation */}
      <mesh
        position={isMobile ? [0, -3, -2.2] : [0, -3.25, -1.5]}
        rotation={[-0.01, -0.2, -0.1]}
        scale={isMobile ? 0.7 : 0.75}
      >
        <boxGeometry args={[2, 1.5, 1]} />
        <meshStandardMaterial color="#915EFF" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh
        position={isMobile ? [0, -2.2, -2.2] : [0, -2.45, -1.5]}
        rotation={[-0.01, -0.2, -0.1]}
        scale={isMobile ? [0.7, 0.3, 0.7] : [0.75, 0.3, 0.75]}
      >
        <boxGeometry args={[2.5, 0.2, 1.5]} />
        <meshStandardMaterial color="#aaa6c3" metalness={0.5} roughness={0.3} />
      </mesh>
    </group>
  )
}

// Error Boundary Class Component
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.warn('3D Model loading error, using fallback:', error)
    if (this.props.onError) {
      this.props.onError()
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <ComputersFallback isMobile={this.props.isMobile} />
        )
      )
    }

    return this.props.children
  }
}

const Computers = ({ isMobile }) => {
  const computer = useGLTF('/desktop_pc/scene.gltf')

  return (
    <mesh>
      <hemisphereLight intensity={0.15} groundColor="black" />
      <spotLight
        position={[-20, 50, 10]}
        angle={0.12}
        penumbra={1}
        intensity={1}
        castShadow
        shadow-mapSize={1024}
      />
      <pointLight intensity={1} />
      <primitive
        object={computer.scene}
        scale={isMobile ? 0.7 : 0.75}
        position={isMobile ? [0, -3, -2.2] : [0, -3.25, -1.5]}
        rotation={[-0.01, -0.2, -0.1]}
      />
    </mesh>
  )
}

const ComputersCanvas = () => {
  const [isMobile, setIsMobile] = useState(false)
  const [useFallback, setUseFallback] = useState(false)
  const [loadTimeout, setLoadTimeout] = useState(false)

  useEffect(() => {
    // Add a listener for changes to the screen size
    const mediaQuery = window.matchMedia('(max-width: 500px)')

    // Set the initial value of the `isMobile` state variable
    setIsMobile(mediaQuery.matches)

    // Define a callback function to handle changes to the media query
    const handleMediaQueryChange = (event) => {
      setIsMobile(event.matches)
    }

    // Add the callback function as a listener for changes to the media query
    mediaQuery.addEventListener('change', handleMediaQueryChange)

    // Remove the listener when the component is unmounted
    return () => {
      mediaQuery.removeEventListener('change', handleMediaQueryChange)
    }
  }, [])

  // Timeout to switch to fallback if model takes too long
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!useFallback) {
        console.warn('Model loading timeout (15s), using fallback')
        setLoadTimeout(true)
        setUseFallback(true)
      }
    }, 15000) // 15 second timeout

    return () => clearTimeout(timeout)
  }, [useFallback])

  return (
    <Canvas
      frameloop="demand"
      shadows
      dpr={[1, 2]}
      camera={{ position: [20, 3, 5], fov: 25 }}
      gl={{ preserveDrawingBuffer: true }}
    >
      <Suspense fallback={<CanvasLoader />}>
        <OrbitControls
          enableZoom={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
        {useFallback || loadTimeout ? (
          <ComputersFallback isMobile={isMobile} />
        ) : (
          <ErrorBoundary
            isMobile={isMobile}
            fallback={<ComputersFallback isMobile={isMobile} />}
            onError={() => setUseFallback(true)}
          >
            <Computers isMobile={isMobile} />
          </ErrorBoundary>
        )}
      </Suspense>

      <Preload all />
    </Canvas>
  )
}

export default ComputersCanvas
