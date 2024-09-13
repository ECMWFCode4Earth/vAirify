import crypto from 'crypto'
import { TextDecoder, TextEncoder } from 'util'

Object.assign(global, { TextDecoder, TextEncoder })
Object.assign(global, { fetch: jest.fn() })

Object.defineProperty(global.self, 'crypto', {
  value: {
    subtle: crypto.webcrypto.subtle,
  },
})

// mock three.js and react-three-fiber components which rely on WebGL
jest.mock('three', () => ({
  WebGLRenderer: jest.fn(),
  Scene: jest.fn(),
  PerspectiveCamera: jest.fn(),
}))

jest.mock('three-stdlib', () => ({
  LottieLoader: jest.fn(),
}))

// Mock @react-three/drei components like CameraControls
jest.mock('@react-three/drei', () => ({
  CameraControls: jest.fn(),
}))

// Mock HTMLCanvasElement getContext method to prevent WebGL context from being called in tests
window.HTMLCanvasElement.prototype.getContext = () => ({
  fillStyle: jest.fn(),
  fillRect: jest.fn(),
})
