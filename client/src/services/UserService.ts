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
    queryKey: ['studentCount'],
    queryFn: async () => {
      const res = await handleApi({ url: `/users/count-by-role/STUDENT`, method: 'GET' })
      return res.data
    }
  })

  return userCount
}

export function useFetchCountUserByTeacherRole() {
  const { data } = useQuery({
    queryKey: ['teacherCount'],
    queryFn: async () => {
      const res = await handleApi({ url: `/users/count-by-role/TEACHER`, method: 'GET' })
      const payload = res.data
      const value = (payload?.data ?? payload?.count) as number | undefined
      return typeof value === 'number' ? value : 0
    }
  })

  return data
}