import fs from 'fs'
import path from 'path'
import process from 'process'
import prompts from 'prompts'
import foundryConfig from '../foundryconfig.json' with { type: 'json' }
import moduleJSON from '../src/module.json' with { type: 'json' }

const fvttVersion = (
  await prompts({
    type: 'select',
    name: 'value',
    message: 'Select the FoundryVTT version you want to use.',
    choices: Object.keys(foundryConfig.fvtt).map((version) => ({
      title: version,
      value: version,
    })),
  })
).value as number

const { appPath, dataPath } = foundryConfig.fvtt[fvttVersion.toString() as keyof typeof foundryConfig.fvtt]

if (!dataPath) {
  console.error(`FoundryVTT data for "${fvttVersion}" not found.`)
  process.exit(1)
}

const dataPathStats = fs.lstatSync(dataPath, {
  throwIfNoEntry: false,
})

if (!dataPathStats?.isDirectory()) {
  console.error(`No folder found at "${dataPath}"`)
  process.exit(1)
}

const symlinkPath = path.resolve(dataPath, 'Data', 'modules', moduleJSON.id)
const symlinkStats = fs.lstatSync(symlinkPath, { throwIfNoEntry: false })

if (symlinkStats) {
  const atPath = symlinkStats.isDirectory() ? 'folder' : symlinkStats.isSymbolicLink() ? 'symlink' : 'file'
  const proceed: boolean = (
    await prompts({
      type: 'confirm',
      name: 'value',
      initial: false,
      message: `A "${moduleJSON.id}" ${atPath} already exists in the "modules" subfolder. Replace with new symlink?`,
    })
  ).value

  if (!proceed) {
    console.log('Aborting.')
    process.exit()
  }
}

try {
  if (symlinkStats?.isDirectory()) {
    fs.rmSync(symlinkPath, { recursive: true, force: true })
  } else if (symlinkStats) {
    fs.unlinkSync(symlinkPath)
  }
  fs.symlinkSync(path.resolve(process.cwd(), 'dist'), symlinkPath)
} catch (error) {
  if (error instanceof Error) {
    console.error(`An error was encountered trying to create a symlink: ${error.message}`)
    process.exit(1)
  }
}

console.log(`Symlink successfully created at "${symlinkPath}"!`)
