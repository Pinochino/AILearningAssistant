import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { handleApi } from "../api/handleApi"

export function useGetUsers(searchTerm: string) {
  const {
    data: users,
    isLoading: userLoading,
    error: errorUser
  } = useQuery({
    queryKey: ['users', { searchTerm }],
    queryFn: async () => {
      const url = searchTerm ? `/users/list?search=${searchTerm}` : '/users/list'
      const res = await handleApi({ url, method: 'GET', withCredentials: true })
      console.log(res.data)
      return res?.data.data
    },
    placeholderData: keepPreviousData
  })

  return users
}

export function useFetchCountUserByUserRole() {

  const {
    data: userCount,
    isLoading: userCountLoading,
    error: userCountError
  } = useQuery({
    queryKey: ['userCount'],
    queryFn: async () => {
      const res = await handleApi({ url: `/users/count-by-role/USER`, method: 'GET' })
      return res.data
    }
  })

  return userCount
}

export function useFetchCountUserByTeacherRole() {
  const {
    data: teacherCount,
    isLoading: teacherCountLoading,
    error: teacherCountError
  } = useQuery({
    queryKey: ['userCount'],
    queryFn: async () => {
      const res = await handleApi({ url: `/users/count-by-role/TEACHER`, method: 'GET' })
      return res.data
    }
  })

  return teacherCount
}