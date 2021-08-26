import { readFileSync } from 'fs'

export interface LocalixConfig {
  spreadsheetId: string
  sheetName: string
  clientEmail: string
  privateKey: string
  variables: Record<string, Record<string, string>>
  output: Record<string, string>
}

export function loadConfig(configPath: string): LocalixConfig {
  return JSON.parse(readFileSync(configPath, 'utf-8'))
}
