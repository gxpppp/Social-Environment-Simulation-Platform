import * as XLSX from 'xlsx'

export interface ImportConfig {
  type: 'excel' | 'csv' | 'json'
  mapping?: Record<string, string>
  skipFirstRow?: boolean
  delimiter?: string
}

export interface ImportResult<T = any> {
  success: boolean
  data: T[]
  errors: ImportError[]
  total: number
  imported: number
}

export interface ImportError {
  row: number
  field: string
  value: any
  message: string
}

export class ImportService {
  /**
   * 读取Excel文件
   */
  static async readExcel(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = e.target?.result
          const workbook = XLSX.read(data, { type: 'binary' })
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
          const jsonData = XLSX.utils.sheet_to_json(firstSheet)
          resolve(jsonData)
        } catch (error) {
          reject(new Error('Excel文件解析失败'))
        }
      }
      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsBinaryString(file)
    })
  }

  /**
   * 读取CSV文件
   */
  static async readCSV(file: File, delimiter = ','): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string
          const lines = text.split('\n').filter((line) => line.trim())
          if (lines.length === 0) {
            resolve([])
            return
          }

          const headers = lines[0].split(delimiter).map((h) => h.trim())
          const data = lines.slice(1).map((line) => {
            const values = line.split(delimiter)
            const row: Record<string, any> = {}
            headers.forEach((header, index) => {
              row[header] = values[index]?.trim() || ''
            })
            return row
          })
          resolve(data)
        } catch (error) {
          reject(new Error('CSV文件解析失败'))
        }
      }
      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsText(file)
    })
  }

  /**
   * 读取JSON文件
   */
  static async readJSON(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string
          const data = JSON.parse(text)
          resolve(Array.isArray(data) ? data : [data])
        } catch (error) {
          reject(new Error('JSON文件解析失败'))
        }
      }
      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsText(file)
    })
  }

  /**
   * 导入数据
   */
  static async importData<T = any>(
    file: File,
    config: ImportConfig,
    validator?: (row: any) => ImportError | null
  ): Promise<ImportResult<T>> {
    const result: ImportResult<T> = {
      success: true,
      data: [],
      errors: [],
      total: 0,
      imported: 0,
    }

    try {
      // 读取文件
      let rawData: any[] = []
      switch (config.type) {
        case 'excel':
          rawData = await this.readExcel(file)
          break
        case 'csv':
          rawData = await this.readCSV(file, config.delimiter)
          break
        case 'json':
          rawData = await this.readJSON(file)
          break
        default:
          throw new Error('不支持的文件类型')
      }

      result.total = rawData.length

      // 跳过首行
      if (config.skipFirstRow) {
        rawData = rawData.slice(1)
      }

      // 字段映射
      if (config.mapping) {
        rawData = rawData.map((row) => {
          const mappedRow: Record<string, any> = {}
          Object.entries(config.mapping!).forEach(([key, value]) => {
            mappedRow[value] = row[key]
          })
          return mappedRow
        })
      }

      // 数据验证
      if (validator) {
        rawData.forEach((row, index) => {
          const error = validator(row)
          if (error) {
            result.errors.push({ ...error, row: index + 1 })
          } else {
            result.data.push(row as T)
          }
        })
      } else {
        result.data = rawData as T[]
      }

      result.imported = result.data.length
      result.success = result.errors.length === 0

      return result
    } catch (error: any) {
      result.success = false
      result.errors.push({
        row: 0,
        field: 'file',
        value: file.name,
        message: error.message,
      })
      return result
    }
  }

  /**
   * 下载导入模板
   */
  static downloadTemplate(columns: string[], filename = 'template.xlsx') {
    const ws = XLSX.utils.aoa_to_sheet([columns])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Template')
    XLSX.writeFile(wb, filename)
  }

  /**
   * 验证场景数据
   */
  static validateScene(row: any): ImportError | null {
    if (!row.name || row.name.trim() === '') {
      return {
        row: 0,
        field: 'name',
        value: row.name,
        message: '场景名称不能为空',
      }
    }
    if (!row.description || row.description.trim() === '') {
      return {
        row: 0,
        field: 'description',
        value: row.description,
        message: '场景描述不能为空',
      }
    }
    return null
  }

  /**
   * 验证Agent数据
   */
  static validateAgent(row: any): ImportError | null {
    if (!row.name || row.name.trim() === '') {
      return {
        row: 0,
        field: 'name',
        value: row.name,
        message: 'Agent名称不能为空',
      }
    }
    if (!row.role || row.role.trim() === '') {
      return {
        row: 0,
        field: 'role',
        value: row.role,
        message: 'Agent角色不能为空',
      }
    }
    return null
  }
}

export default ImportService
