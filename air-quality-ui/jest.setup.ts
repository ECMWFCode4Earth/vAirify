import { TextDecoder, TextEncoder } from 'util'

Object.assign(global, { TextDecoder, TextEncoder })
Object.assign(global, { fetch: jest.fn() })