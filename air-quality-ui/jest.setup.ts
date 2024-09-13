import crypto from 'crypto'
import { TextDecoder, TextEncoder } from 'util'

Object.assign(global, { TextDecoder, TextEncoder })
Object.assign(global, { fetch: jest.fn() })

Object.defineProperty(global.self, 'crypto', {
  value: {
    subtle: crypto.webcrypto.subtle,
  },
})

// moke three.js and react-three-fiber components which rely on WebGL
jest.mock('@react-three/fiber', () => {
  const ReactThreeFiber = jest.requireActual('@react-three/fiber');

  return {
    ...ReactThreeFiber,
    Canvas: ({ children }) => <div>{children}</div>, // Mocking the Canvas
  };
});

jest.mock('@react-three/drei', () => {
  return {
    CameraControls: () => <div />, // Mocking CameraControls component
    // Add more mocks as needed
  };
});

window.HTMLCanvasElement.prototype.getContext = () => {
  return {
    fillStyle: jest.fn(),
    fillRect: jest.fn(),
    // Add more mocked methods if needed
  };
};
