import { Button, Space, Table, Tag } from 'antd';
import type { TableProps } from 'antd';
import getAllData from '../../hooks/getAllData';
import { authUrls } from '../../constant/AuthUrls';
import { userUrls } from '../../constant/UserUrls';


interface DataType {
  _id: string;
  username: string;
  email: number;
  roles: string[];
}

const columns: TableProps<DataType>['columns'] = [
  {
    title: 'Id',
    dataIndex: '_id',
    key: '_id',
    render: (text) => <a>{text}</a>,
  },
  {
    title: 'Username',
    dataIndex: 'username',
    key: 'username',
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: 'Roles',
    key: 'roles',
    dataIndex: 'roles',
    render: (_, { roles }) => (
      <>
        {(Array.isArray(roles) ? Array.from(roles) : []).map((role) => {
          let color = role.length > 5 ? 'geekblue' : 'green';
          if (role === 'loser') {
            color = 'volcano';
          }
          return (
            <Tag color={color} key={role}>
              {role?.name || 'USER'}
            </Tag>
          );
        })}
      </>
    ),
  },
  {
    title: 'Action',
    key: 'action',
    render: (_, record) => (
      <Space size="middle">
        <Button color="cyan" variant="solid">Update</Button>
        <Button danger >Delete</Button>
      </Space>
    ),
  },
];

// const data: DataType[] = [
//   {
//     key: '1',
//     name: 'John Brown',
//     age: 32,
//     address: 'New York No. 1 Lake Park',
//     tags: ['nice', 'developer'],
//   },
//   {
//     key: '2',
//     name: 'Jim Green',
//     age: 42,
//     address: 'London No. 1 Lake Park',
//     tags: ['loser'],
//   },
//   {
//     key: '3',
//     name: 'Joe Black',
//     age: 32,
//     address: 'Sydney No. 1 Lake Park',
//     tags: ['cool', 'teacher'],
//   },
// ];

const UserManagementPage = () => {

  const { data, isLoading, error } = getAllData({ url: userUrls.getUsers, limit: 10, order: 'asc' });


  if (isLoading) {
    return <h2>This website have been loading</h2>
  }

  if (error) {
    return <h2>Error: {error.message}</h2>
  }

  return (
    <Table<DataType> columns={columns} dataSource={data?.data.data ?? []} />
  )

};

export default UserManagementPage;