import { Button, Modal, Table, TableProps } from 'antd'
import React, { useState } from 'react'
import getAllData from '../../../hooks/getAllData'
import { ColumnsType } from 'antd/es/table'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { RootState } from '@/redux/store'
import { closeModal, openModal } from '@/redux/reducers/diaglogReducer'

interface IFilterTable<T> {
  url: string
  createMode?: boolean
  columns: ColumnsType<T>
}

type TableRowSelection<T extends object = object> = TableProps<T>['rowSelection']

function FilterTable<T extends { key: React.Key }>({ url, columns, createMode }: IFilterTable<T>) {
  const { data, isLoading, error } = getAllData({ url, limit: 10, order: 'asc' })
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const { isOpen } = useAppSelector((state: RootState) => state.modal.createUser)
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [modalText, setModalText] = useState<string>('Content of the modal');

  const dispatch = useAppDispatch();

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
        },
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
        },
      },
    ],
  }

  if (isLoading) {
    return <h2>This website have been loading</h2>
  }

  if (error) {
    return <h2>Error: {error.message}</h2>
  }

  const showModal = () => {
    dispatch(openModal(isOpen))
  }

  const handleOk = () => {
    setModalText("The modal will be closed after two seconds");
    setConfirmLoading(true)
    setTimeout(() => {
      dispatch(closeModal(isOpen))
      setConfirmLoading(false);
    }, 2000)
  }

  const handleCancel = () => {
    console.log('Clicked cancel button');
    dispatch(closeModal(isOpen))
  }

  return (
    <div>
      {
        createMode === true &&
        <>
          <div className='flex justify-end'>  <Button
            onClick={showModal}
            type='primary'>Create</Button></div>
          <Modal
            title="Title"
            open={isOpen}
            onOk={handleOk}
            confirmLoading={confirmLoading}
            onCancel={handleCancel}
          >
            <p>{modalText}</p>
          </Modal>
        </>
      }
      <Table<T>
        columns={columns}
        dataSource={data?.data.data ?? []}
        rowSelection={rowSelection}
        onChange={handleFilterandSorter}
        showSorterTooltip={{ target: 'sorter-icon' }}
      />
    </div>
  )
}

export default FilterTable
