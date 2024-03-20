import fs from 'fs'
import path from 'path'
import * as fsPromises from 'fs/promises'
import copy from 'rollup-plugin-copy'
import scss from 'rollup-plugin-scss'
import { createLogger, defineConfig, Plugin } from 'vite'

const moduleVersion = process.env.MODULE_VERSION
const githubProject = process.env.GH_PROJECT
const githubTag = process.env.GH_TAG
const TEST_SETUP_FILE_NAME = 'test-setup'

console.log(process.env.VSCODE_INJECTION)

export default defineConfig(({ mode }) => {
  return {
    esbuild: {
      keepNames: mode !== 'production',
      minifyIdentifiers: mode === 'production',
    },
    build: {
      sourcemap: true,
      rollupOptions: {
        input: ['src/ts/module.ts', ...(mode === 'testing' ? [`src/ts/${TEST_SETUP_FILE_NAME}.ts`] : [])],
        output: {
          dir: 'dist',
          entryFileNames: 'scripts/[name].js',
          format: 'es',
        },
      },
    },
    plugins: [
      customTsConfig({
        filename: `tsconfig.${mode}.json`,
      }),
      updateModuleManifestPlugin({ mode }),
      scss({
        fileName: 'style.css',
        sourceMap: false,
        watch: ['src/styles/**/*.scss'],
      }),
      copy({
        targets: [
          { src: 'src/languages', dest: 'dist' },
          { src: 'src/templates', dest: 'dist' },
        ],
        hook: 'writeBundle',
      }),
      addWatchedFilesPlugin(),
    ],
  }
})

function addWatchedFilesPlugin(): Plugin {
  return {
    name: 'add-watched-files',
    async buildStart() {
      this.addWatchFile('src/module.json')

      const translations = await fsPromises.readdir('src/languages')
      translations.forEach((file) => {
        this.addWatchFile(`src/languages/${file}`)
      })

      const templates = await fsPromises.readdir('src/templates')
      templates.forEach((file) => {
        this.addWatchFile(`src/templates/${file}`)
      })
    },
  }
}

function updateModuleManifestPlugin({ mode }: { mode: string }): Plugin {
  return {
    name: 'update-module-manifest',
    async writeBundle(): Promise<void> {
      const packageContents = JSON.parse(await fsPromises.readFile('./package.json', 'utf-8')) as Record<
        string,
        unknown
      >
      const version = moduleVersion || (packageContents.version as string)
      const manifestContents: string = await fsPromises.readFile('src/module.json', 'utf-8')
      const manifestJson = JSON.parse(manifestContents) as Record<string, unknown>
      manifestJson['version'] = version

      if (githubProject) {
        const baseUrl = `https://github.com/${githubProject}/releases`
        manifestJson['manifest'] = `${baseUrl}/latest/download/module.json`
        if (githubTag) {
          manifestJson['download'] = `${baseUrl}/download/${githubTag}/module.zip`
        }
      }

      if (mode === 'testing') {
        const modules = manifestJson.esmodules as string[]
        modules.push(`scripts/${TEST_SETUP_FILE_NAME}.js`)
      }

      await fsPromises.writeFile('dist/module.json', JSON.stringify(manifestJson, null, 4))
    },
  }
}

function customTsConfig({ filename }: { filename: string }): Plugin {
  const originalFilePath = 'tsconfig.json'
  const temporaryFilePath = `${originalFilePath}.bak`
  const log = createLogger('warn', { prefix: '[customTsConfig]' })

  return {
    name: 'custom-tsconfig',
    async buildStart() {
      const root = process.cwd()
      const tsConfigPath = path.resolve(root, originalFilePath)
      const backupPath = path.resolve(root, temporaryFilePath)

      if (fs.existsSync(backupPath)) {
        await fsPromises.rm(backupPath)
      }

      await fsPromises.rename(tsConfigPath, backupPath)

      const providedTsConfigPath = path.resolve(root, filename)
      await fsPromises.copyFile(providedTsConfigPath, tsConfigPath)
    },
    async closeBundle() {
      const root = process.cwd()
      const tsConfigPath = path.resolve(root, originalFilePath)

      if (!fs.existsSync(tsConfigPath)) {
        return
      }

      await fsPromises.rm(tsConfigPath)

      const backupPath = path.resolve(root, temporaryFilePath)

      if (!fs.existsSync(backupPath)) {
        log.error(`Backup file ${backupPath} does not exist.`)
        return
      }

      await fsPromises.rename(backupPath, tsConfigPath)
    },
  }
}
