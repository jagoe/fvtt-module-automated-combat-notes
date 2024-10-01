import '@league-of-foundry-developers/foundry-vtt-types/src/foundry/client/head'

export {}

declare global {
  interface ImportMeta {
    glob: (pattern: string, options: { eager: boolean }) => void
  }
}
