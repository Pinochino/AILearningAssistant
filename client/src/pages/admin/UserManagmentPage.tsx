import React from 'react'
import { Button, Popconfirm, Space, Tag } from 'antd'
import type { TableProps } from 'antd'
import { userUrls } from '../../constant/UserUrls'
import FilterTable from '../../components/ui/tables/FilterTable'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { RootState } from '@/redux/store'
import { useDispatch } from 'react-redux'
import { closeModal, openModal } from '@/redux/reducers/diaglogReducer'
import { authUrls } from '@/constant/AuthUrls'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import handleApi from '@/api/handleApi'

export interface UsersDataType {
  key: React.Key
  _id: string
  username: string
  email: number
  roles: string[]
}



const UserManagementPage = () => {

  const queryClient = useQueryClient()


  const mutation = useMutation({
    mutationFn: (id: string) => handleApi({ url: `${userUrls.deleteUser}/${id}`, method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [`${userUrls.getUsers}`] })
  })

  const handleDelete = (id: string) => {
    mutation.mutate(id)
  }

  const columns: TableProps<UsersDataType>['columns'] = [
    {
      title: 'Id',
      dataIndex: '_id',
      key: '_id',
      render: (text) => <a>{text}</a>,
    },
    {
      title: 'Username',
      dataIndex: 'username',
      showSorterTooltip: { target: 'full-header' },
      key: 'username',
      onFilter: (value, record) => record.username.indexOf(value as string) === 0,
      sorter: (a, b) => a.username.length - b.username.length,
      sortDirections: ['descend'],
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: (a, b) => a.email - b.email,
      filterSearch: true,
    },
    {
      title: 'Roles',
      key: 'roles',
      dataIndex: 'roles',
      render: (_, { roles }) => (
        <>
          {(Array.isArray(roles) ? Array.from(roles) : []).map((role) => {
            let color = role.length > 5 ? 'geekblue' : 'green'
            if (role === 'loser') {
              color = 'volcano'
            }
            return (
              <Tag color={color} key={role}>
                {role?.name || 'USER'}
              </Tag>
            )
          })}
        </>
      ),
      filterSearch: true,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) =>
        
          (
            (
              <Space size="middle">
                <Button color="cyan" variant="solid">
                  Update
                </Button>
                <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record._id as string)}>
                  <Button danger>Delete</Button>
                </Popconfirm>
              </Space>
            )
          ) 


    },
  ]



  const dispatch = useDispatch();
  const handleShowModal = () => {
    dispatch(openModal({ title: 'CreateUser', modalType: 'createUser', pathApi: authUrls.register }))
  }
  return <FilterTable<UsersDataType> url={userUrls.getUsers} columns={columns} handleShowModal={handleShowModal} createMode />
}

export default UserManagementPage
