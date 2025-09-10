import { useQuery } from '@tanstack/react-query'
import React from 'react'

const UserManagmentPage = () => {
  const { isPending, error, data } = useQuery({
    queryKey: [''],
    queryFn: () => {

    }
  })
  return (
    <div>

    </div>
  )
}

export default UserManagmentPage