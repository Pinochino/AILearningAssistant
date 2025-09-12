import { Table, TableProps } from 'antd'
import React, { useState } from 'react'
import getAllData from '../../../hooks/getAllData'
import { ColumnsType } from 'antd/es/table'

interface IFilterTable<T> {
  url: string
  columns: ColumnsType<T>
}

type TableRowSelection<T extends object = object> = TableProps<T>['rowSelection']

function FilterTable<T extends { key: React.Key }>({ url, columns }: IFilterTable<T>) {
  const { data, isLoading, error } = getAllData({ url, limit: 10, order: 'asc' })
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])

  const handleSelection = (newSelectedRowKeys: React.Key[]) => {
    console.log(`selectedRowKeys changed: `, newSelectedRowKeys)
    setSelectedRowKeys(newSelectedRowKeys)
  }

  const handleFilterandSorter: TableProps<T>['onChange'] = (pagination, filters, sorter, extra) => {
    console.log('params', pagination, filters, sorter, extra)
  }

  const rowSelection: TableRowSelection<T> = {
    selectedRowKeys,
    onChange: handleSelection,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
      {
        key: 'odd',
        text: `Select Odd Row`,
        onSelect: (changeableRowKeys) => {
          let newSelectedRowKeys = []
          newSelectedRowKeys = changeableRowKeys.filter((_, index) => {
            if (index % 2 !== 0) {
              return false
            }
            return true
          })
          setSelectedRowKeys(newSelectedRowKeys)
        }
      },
      {
        key: 'even',
        text: 'Select Even Row',
        onSelect: (changeableRowKeys) => {
          let newSelectedRowKeys = []
          newSelectedRowKeys = changeableRowKeys.filter((_, index) => {
            if (index % 2 !== 0) {
              return true
            }
            return false
          })
          setSelectedRowKeys(newSelectedRowKeys)
        }
      }
    ]
  }

  if (isLoading) {
    return <h2>This website have been loading</h2>
  }

  if (error) {
    return <h2>Error: {error.message}</h2>
  }

  return (
    <Table<T>
      columns={columns}
      dataSource={data?.data.data ?? []}
      rowSelection={rowSelection}
      onChange={handleFilterandSorter}
      showSorterTooltip={{ target: 'sorter-icon' }}
    />
  )
}

export default FilterTable
