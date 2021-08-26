import { Command, command, param } from 'clime'
import { loadConfig } from '../lib/Config'
import { Sheets } from '../lib/Sheets'
import { writer } from '../lib/writer'

@command({ description: 'Generate localizations from Google Sheets' })
export default class extends Command {
  async execute(
    @param({ description: 'Path to configuration file', required: false, name: 'config', default: 'localix.json' }) configPath: string
  ) {
    const config = loadConfig(configPath)
    console.info(`~> generating locales from '${config.spreadsheetId}' in sheet '${config.sheetName}'`)
    const sheets = await Sheets.load(config)
    const allRows = await sheets.parse()
    const locales = allRows.reduce<Set<string>>((set, row) => {
      const keys = Object.keys(row.locales)
      for (const key of keys) { set.add(key) }
      return set
    }, new Set())
    const defaults = allRows.reduce<Record<string, string>>((obj, row) => { obj[row.key] = row.locales['en']; return obj }, {})
    const platforms = Object.keys(config.output)
    for (const platform of platforms) {
      console.info(`~> generating locales for ${platform}`)
      const rows = allRows.filter((row) => row.platforms.includes(platform)).map((row) => ({
        key: row.key,
        platforms: row.platforms,
        locales: Object.entries(row.locales).reduce<Record<string, string>>((obj, [key, value]) => {
          obj[key] = Object.entries(config.variables).reduce<string>((string, [variableName, replacements]) => {
            return string.replace(variableName, replacements[platform])
          }, value || defaults[row.key])
          return obj
        }, {})
      }))
      for (const locale of locales) {
        writer[platform]({ config, locale, rows })
      }
    }
  }
}
