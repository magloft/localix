import { google, sheets_v4 } from 'googleapis'
import { LocalixConfig } from './Config'

export interface SheetRow {
  key: string
  platforms: string[]
  locales: Record<string, string>
}

export class Sheets {
  private client: sheets_v4.Sheets
  private sheet!: sheets_v4.Schema$Sheet

  static async load(config: LocalixConfig) {
    const sheets = new Sheets(config)
    await sheets.load()
    return sheets
  }

  constructor(private config: LocalixConfig) {
    const auth = new google.auth.JWT( config.clientEmail, undefined, config.privateKey, ['https://www.googleapis.com/auth/spreadsheets'])
    this.client = google.sheets({ version: 'v4', auth })
  }

  async load() {
    const { data } = await this.client.spreadsheets.get({ spreadsheetId: this.config.spreadsheetId })
    if (!data.sheets) { throw new Error('The spreadsheet doesn\n contain any sheets') }
    const sheet = data.sheets.find(({ properties }) => properties?.title === this.config.sheetName)
    if (!sheet) { throw new Error(`The sheet '${this.config.sheetName}' wasn't found`) }
    this.sheet = sheet
  }

  async parse() {
    const { spreadsheetId, sheetName } = this.config
    const { data } = await this.client.spreadsheets.values.get({ spreadsheetId, range: String(sheetName) })
    const values = data.values as string[][]
    const headers = values.shift()!.map((header) => header.split(' ')[0].trim())
    const rows = values.map<SheetRow>((valueRow) => {
      return valueRow.reduce<SheetRow>((obj, value, index) => {
        const name = headers[index]
        if (name === 'key') {
          obj.key = value.trim()
        } else if (name === 'platforms') {
          obj.platforms = value.trim().split(',')
        } else {
          obj.locales[name] = value.trim()
        }
        return obj
      }, { key: '', platforms: [], locales: {} })
    }, []).filter(({ key }) => key)
    return rows
  }

  get sheetId() {
    return this.sheet.properties?.sheetId
  }
}
