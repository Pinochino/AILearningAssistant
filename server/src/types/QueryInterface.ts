type orderType = 'asc' | 'desc'

export interface QueryInterface {
  search?: string
  order?: orderType
  limit?: number
  skip?: number
  sortBy?: string
}
