import * as XLSX from 'xlsx'

const xlsxService = {
  downloadFile: async (data: any[], sheetName: string) => {
    try {
      const ws = XLSX.utils.json_to_sheet(data)

      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, sheetName)

      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
      return buf
    } catch (error: any) {
      throw new Error(error.message)
    }
  }
}

export default xlsxService
