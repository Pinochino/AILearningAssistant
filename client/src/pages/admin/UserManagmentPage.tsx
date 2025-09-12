import React from 'react'
import { Button, Space, Tag } from 'antd'
import type { TableProps } from 'antd'
import { userUrls } from '../../constant/UserUrls'
import FilterTable from '../../components/ui/tables/FilterTable'

export interface UsersDataType {
  key: React.Key
  _id: string
  username: string
  email: number
  roles: string[]
}

const columns: TableProps<UsersDataType>['columns'] = [
  {
    title: 'Id',
    dataIndex: '_id',
    key: '_id',
    render: (text) => <a>{text}</a>
  },
  {
    title: 'Username',
    dataIndex: 'username',
    showSorterTooltip: { target: 'full-header' },
    key: 'username',
    onFilter: (value, record) => record.username.indexOf(value as string) === 0,
    sorter: (a, b) => a.username.length - b.username.length,
    sortDirections: ['descend']
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    sorter: (a, b) => a.email - b.email,
    filterSearch: true
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
    filterSearch: true
  },
  {
    title: 'Action',
    key: 'action',
    render: (_, record) => (
      <Space size='middle'>
        <Button color='cyan' variant='solid'>
          Update
        </Button>
        <Button danger>Delete</Button>
      </Space>
    )
  }
]

const UserManagementPage = () => {
  return <FilterTable<UsersDataType> url={userUrls.getUsers} columns={columns} />
}

export default UserManagementPage
