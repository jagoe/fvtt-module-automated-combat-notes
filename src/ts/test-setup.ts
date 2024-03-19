import { MODULE_NAME } from './constants'

console.log(`${MODULE_NAME} | Initializing tests`)

// Import all test files
;(import.meta as any).glob('./**/*.spec.ts', { eager: true })
