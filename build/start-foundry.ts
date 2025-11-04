import { spawn } from 'child_process'
import fs from 'fs-extra'
import path from 'path'
import process from 'process'
import prompts from 'prompts'
import foundryConfig from '../foundryconfig.json' with { type: 'json' }

const fvttVersion = (
  await prompts({
    type: 'select',
    name: 'value',
    message: 'Select the FoundryVTT version you want to use.',
    choices: Object.keys(foundryConfig.fvtt)
      .map((version) => version)
      .sort((a, b) => -a.localeCompare(b))
      .map((version) => ({
        title: version,
        value: version,
      })),
  })
).value as number

const { appPath, dataPath } = foundryConfig.fvtt[fvttVersion.toString() as keyof typeof foundryConfig.fvtt]

if (!appPath) {
  console.error(`FoundryVTT version "${fvttVersion}" not found.`)
  process.exit(1)
}

if (!dataPath) {
  console.error(`FoundryVTT data for "${fvttVersion}" not found.`)
  process.exit(1)
}

const world = fs.existsSync(path.resolve(dataPath, 'Data'))
  ? ((
      await prompts({
        type: 'select',
        name: 'value',
        message: 'Select the world you want to start into.',
        choices: [{ title: '—', value: '' }].concat(
          fs
            .readdirSync(path.resolve(dataPath, 'Data', 'worlds'))
            .filter((dir) => fs.statSync(path.resolve(dataPath, 'Data', 'worlds', dir)).isDirectory())
            .map((dir) => ({
              title: dir,
              value: dir,
            })),
        ),
      })
    ).value as string)
  : ''

const windowsExecPath = path.resolve(appPath, 'Foundry Virtual Tabletop.exe')
const nodeEntryPoint =
  fvttVersion < 13 ? path.resolve(appPath, 'resources', 'app', 'main.js') : path.resolve(appPath, 'main.js')
const macApp = appPath

const startFoundry = async () => {
  try {
    if (fs.existsSync(windowsExecPath)) {
      console.log(`Starting FoundryVTT from ${windowsExecPath}...`)
      console.log('Make sure to close FoundryVTT instead of using Ctrl-C to stop it.')

      const quotedPath = `"${windowsExecPath}"`
      await spawn(quotedPath)
    } else if (fs.existsSync(nodeEntryPoint)) {
      console.log(`Starting FoundryVTT from ${nodeEntryPoint}...`)

      await spawn(`node`, [nodeEntryPoint, `--dataPath=${dataPath}`, `--world=${world}`], {
        stdio: 'inherit',
      })
    } else if (macApp.endsWith('.app')) {
      console.log(`Starting ${macApp}...`)
      await spawn('open', [
        `-a "${macApp}"`,
        `--env=FOUNDRY_VTT_DATA_PATH="${dataPath.substring(0, dataPath.length - 5)}"`,
        `--env=FOUNDRY_VTT_WORLD="${world}"`,
      ])
    } else {
      console.error(`Cannot start FoundryVTT. "${appPath}" is not a valid Foundry path.`)
      process.exit(1)
    }
  } catch (error) {
    console.error(error)
  }
}

startFoundry().catch(console.error)
