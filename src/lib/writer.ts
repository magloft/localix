import { mkdirpSync, writeFileSync } from 'fs-extra'
import { dirname, join } from 'path'
import { LocalixConfig } from './Config'
import { SheetRow } from './Sheets'

export interface WriterOptions {
  config: LocalixConfig
  locale: string
  rows: SheetRow[]
}

export type WriterFn = (options: WriterOptions) => void

export const writeFile = (filePath: string, contents: string) => {
  const dir = dirname(filePath)
  mkdirpSync(dir)
  writeFileSync(filePath, contents, 'utf-8')
}

export const writeAndroid: WriterFn = ({ config, locale, rows }) => {
  const lines = rows.map(({ key, locales }) => `  <string name="${key}">${locales[locale]}</string>`)
  const contents = `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n${lines.join('\n')}\n</resources>`
  const dirName = locale === 'en' ? 'values' : `values-${locale}`
  writeFile(join(config.output['android'], dirName, 'strings.xml'), contents)
}

export const writeiOS: WriterFn = ({ config, locale, rows }) => {
  const contents = rows.map(({ key, locales }) => `"${key}" = "${locales[locale]}";`).join('\n')
  writeFile(join(config.output['ios'], `${locale}.lproj`, 'Localizable.strings'), contents)
}

export const writeJSON: WriterFn = ({ config, locale, rows }) => {
  const contents = JSON.stringify(rows.reduce<Record<string, string>>((obj, { key, locales }) => {
    obj[key] = locales[locale]
    return obj
  }, {}), null, 2)
  writeFile(join(config.output['json'], `${locale}.json`), contents)
}

export const writer: Record<string, WriterFn> = {
  ios: writeiOS,
  android: writeAndroid,
  json: writeJSON
}
